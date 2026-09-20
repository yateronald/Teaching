import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Empty, Segmented, Skeleton, Tooltip } from 'antd';
import {
    AimOutlined, DesktopOutlined, GlobalOutlined, MinusOutlined, MobileOutlined, PlusOutlined,
} from '@ant-design/icons';
import { geoNaturalEarth1, geoPath, type GeoPermissibleObjects } from 'd3-geo';
import { feature } from 'topojson-client';
import { alpha2For } from './countryCodes';
import {
    compact, countryName, duration, flag, ms, type GeoCountry, type GeoData,
} from './monitoringModel';

/* ══════════════════════════════════════════
   WHERE VISITORS ARE
   A world map shaded by how much each country visits, with everything known
   about a country on hover. The shapes are bundled with the app and drawn as
   plain SVG — no tile server, no map key, and nothing leaves the browser.
══════════════════════════════════════════ */

/** What the map is shaded by. */
type Measure = 'visitors' | 'visits' | 'speed';

const MEASURES: { key: Measure; label: string; hint: string }[] = [
    { key: 'visitors', label: 'Visitors', hint: 'People, counted once a day each' },
    { key: 'visits', label: 'Page views', hint: 'Pages opened in total' },
    { key: 'speed', label: 'Speed', hint: 'How fast pages load there (75th percentile)' },
];

const WIDTH = 960;
const HEIGHT = 480;
const MAX_ZOOM = 8;

/** Light to deep indigo — the scale the audience view already uses. */
const SHADES = ['#e8eaff', '#c9cdfa', '#a5abf2', '#7c83e8', '#5a5fdb', '#4338ca'];
/** Fast to slow, for the speed view. */
const SPEED_SHADES = ['#0e9f6e', '#65c18c', '#c2d36b', '#f0b429', '#e8833a', '#e02424'];

type Shape = { id: string; code: string | null; name: string; d: string };

const MonitoringMap: React.FC<{ data: GeoData | null; loading?: boolean }> = ({ data, loading }) => {
    const [shapes, setShapes] = useState<Shape[] | null>(null);
    const [failed, setFailed] = useState(false);
    const [measure, setMeasure] = useState<Measure>('visitors');
    const [hover, setHover] = useState<{ code: string | null; name: string; x: number; y: number } | null>(null);
    const [pinned, setPinned] = useState<string | null>(null);
    const [view, setView] = useState({ k: 1, x: 0, y: 0 });
    const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
    const frame = useRef<HTMLDivElement | null>(null);

    // The country shapes are 100 KB, so they load when this tab is first opened
    // and never on the pages that don't draw a map.
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const world = (await import('world-atlas/countries-110m.json')).default as unknown;
                if (cancelled) return;
                const topo = world as Parameters<typeof feature>[0];
                const collection = feature(topo, (topo as any).objects.countries) as unknown as {
                    features: { id?: string | number; properties: { name: string }; geometry: unknown }[];
                };
                // Antarctica is drawn by no analytics map worth the name: it is a
                // third of the height and never has a visitor. Dropping it also
                // lets the inhabited world fill the frame.
                const drawn = collection.features.filter(f => String(f.id) !== '010');
                const projection = geoNaturalEarth1()
                    .fitSize([WIDTH, HEIGHT], { type: 'FeatureCollection', features: drawn } as unknown as GeoPermissibleObjects);
                const path = geoPath(projection);
                setShapes(drawn.map(f => ({
                    id: String(f.id ?? f.properties.name),
                    code: alpha2For(f.id as string),
                    name: f.properties.name,
                    d: path(f as unknown as GeoPermissibleObjects) || '',
                })).filter(s => s.d));
            } catch {
                if (!cancelled) setFailed(true);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const byCode = useMemo(() => {
        const map = new Map<string, GeoCountry>();
        (data?.countries || []).forEach(c => map.set(c.country, c));
        return map;
    }, [data]);

    /** The value a country is shaded by, and the top of the scale. */
    const valueOf = useCallback((country?: GeoCountry) => {
        if (!country) return null;
        if (measure === 'visits') return country.visits;
        if (measure === 'visitors') return country.visitors;
        return country.load_p75 ?? null;
    }, [measure]);

    const scale = useMemo(() => {
        const values = (data?.countries || [])
            .filter(c => c.country !== '??')
            .map(c => valueOf(c))
            .filter((v): v is number => typeof v === 'number' && v > 0)
            .sort((a, b) => a - b);
        if (!values.length) return null;
        // Quantiles, so one very large country does not flatten everyone else.
        const at = (p: number) => values[Math.min(values.length - 1, Math.floor(values.length * p))];
        return { min: values[0], max: values[values.length - 1], steps: [at(0.2), at(0.4), at(0.6), at(0.8), at(0.95)] };
    }, [data, valueOf]);

    const shadeFor = useCallback((country?: GeoCountry) => {
        const value = valueOf(country);
        if (!scale || value === null || value === undefined) return null;
        const palette = measure === 'speed' ? SPEED_SHADES : SHADES;
        const index = scale.steps.findIndex(step => value <= step);
        return palette[index === -1 ? palette.length - 1 : index];
    }, [scale, valueOf, measure]);

    const selected = pinned ? byCode.get(pinned) : (hover?.code ? byCode.get(hover.code) : undefined);
    const selectedName = pinned ? countryName(pinned) : hover?.name;

    // ── Panning and zooming, without another dependency ──
    const zoomBy = (factor: number) => setView(v => {
        const k = Math.min(MAX_ZOOM, Math.max(1, v.k * factor));
        return k === 1 ? { k: 1, x: 0, y: 0 } : { ...v, k };
    });
    const onWheel = (e: React.WheelEvent) => { e.preventDefault(); zoomBy(e.deltaY < 0 ? 1.15 : 1 / 1.15); };
    const onPointerDown = (e: React.PointerEvent) => {
        if (view.k === 1) return;
        drag.current = { x: e.clientX, y: e.clientY, ox: view.x, oy: view.y };
        (e.target as Element).setPointerCapture?.(e.pointerId);
    };
    const onPointerMove = (e: React.PointerEvent) => {
        if (!drag.current) return;
        const limit = (WIDTH * (view.k - 1)) / 2;
        setView(v => ({
            ...v,
            x: Math.max(-limit, Math.min(limit, drag.current!.ox + (e.clientX - drag.current!.x))),
            y: Math.max(-limit, Math.min(limit, drag.current!.oy + (e.clientY - drag.current!.y))),
        }));
    };
    const endDrag = () => { drag.current = null; };

    const moveTooltip = (e: React.MouseEvent, code: string | null, name: string) => {
        const box = frame.current?.getBoundingClientRect();
        setHover({ code, name, x: e.clientX - (box?.left ?? 0), y: e.clientY - (box?.top ?? 0) });
    };

    if (loading && !data) return <div className="mon-card"><Skeleton active paragraph={{ rows: 6 }} /></div>;
    if (!data) return null;

    const totals = data.totals;
    const ranked = (data.countries || []).filter(c => c.country !== '??').slice(0, 10);
    const unplaced = data.countries?.find(c => c.country === '??');

    return (
        <div className="mon-body">
            <section className="mon-kpis">
                <div className="mon-kpi">
                    <span className="mon-kpi-label"><GlobalOutlined /> Countries</span>
                    <strong>{totals.countries}</strong>
                    <span className="mon-delta is-flat">reached in this period</span>
                </div>
                <div className="mon-kpi">
                    <span className="mon-kpi-label">Visitors</span>
                    <strong>{compact(totals.visitors)}</strong>
                    <span className="mon-delta is-flat">{compact(totals.visits)} page views</span>
                </div>
                {ranked[0] && (
                    <div className="mon-kpi">
                        <span className="mon-kpi-label">Largest audience</span>
                        <strong className="mon-kpi-country">{flag(ranked[0].country)} {countryName(ranked[0].country)}</strong>
                        <span className="mon-delta is-flat">{ranked[0].share}% of page views</span>
                    </div>
                )}
                {unplaced && (
                    <div className="mon-kpi">
                        <Tooltip title="Visitors whose browser reported no usable time zone, and whose country could not be worked out. They are counted, just not placed.">
                            <span className="mon-kpi-label">Not placed</span>
                        </Tooltip>
                        <strong>{compact(unplaced.visits)}</strong>
                        <span className="mon-delta is-flat">{unplaced.share}% of page views</span>
                    </div>
                )}
            </section>

            <section className="mon-card mon-map-card">
                <header>
                    <h3>Where visitors are</h3>
                    <Segmented
                        size="small"
                        value={measure}
                        onChange={(v) => setMeasure(v as Measure)}
                        options={MEASURES.map(m => ({ value: m.key, label: <Tooltip title={m.hint}><span>{m.label}</span></Tooltip> }))}
                        aria-label="Shade the map by"
                    />
                </header>

                <div
                    className={`mon-map${view.k > 1 ? ' is-zoomed' : ''}`}
                    ref={frame}
                    onWheel={onWheel}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={endDrag}
                    onPointerLeave={() => { endDrag(); setHover(null); }}
                >
                    {failed ? (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="The map could not be loaded." />
                    ) : !shapes ? (
                        <Skeleton.Node active className="mon-map-loading" style={{ width: '100%', height: 320 }}><span /></Skeleton.Node>
                    ) : (
                        <svg
                            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                            className="mon-map-svg"
                            role="img"
                            aria-label={`Visitors by country. ${totals.countries} countries in this period. The table below lists them.`}
                        >
                            <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`} style={{ transformOrigin: 'center' }}>
                                {shapes.map(shape => {
                                    const country = shape.code ? byCode.get(shape.code) : undefined;
                                    const fill = shadeFor(country);
                                    const isPicked = !!shape.code && (pinned === shape.code || hover?.code === shape.code);
                                    return (
                                        <path
                                            key={shape.id}
                                            d={shape.d}
                                            data-country={shape.code || undefined}
                                            className={`mon-map-country${country ? ' has-data' : ''}${isPicked ? ' is-picked' : ''}`}
                                            fill={fill || 'var(--mon-map-empty)'}
                                            strokeWidth={1 / view.k}
                                            onMouseMove={(e) => moveTooltip(e, shape.code, shape.name)}
                                            onMouseLeave={() => setHover(null)}
                                            onClick={() => country && setPinned(p => (p === shape.code ? null : shape.code))}
                                        >
                                            <title>{shape.name}{country ? ` — ${country.visitors} visitors` : ''}</title>
                                        </path>
                                    );
                                })}
                            </g>
                        </svg>
                    )}

                    {hover && (
                        <div
                            className="mon-map-tip"
                            style={{ left: hover.x, top: hover.y }}
                            role="tooltip"
                        >
                            <strong>
                                <span className="mon-flag">{flag(hover.code)}</span>
                                {hover.code ? countryName(hover.code) : hover.name}
                            </strong>
                            {(() => {
                                const c = hover.code ? byCode.get(hover.code) : undefined;
                                if (!c) return <em>No visit from here yet.</em>;
                                return (
                                    <dl>
                                        <div><dt>Visitors</dt><dd>{compact(c.visitors)}</dd></div>
                                        <div><dt>Page views</dt><dd>{compact(c.visits)} · {c.share}%</dd></div>
                                        <div><dt>Time on page</dt><dd>{duration(c.avg_seconds)}</dd></div>
                                        <div><dt>Page load</dt><dd>{c.load_p75 ? ms(c.load_p75) : '—'}</dd></div>
                                        <div><dt>Bounce rate</dt><dd>{c.bounce_rate}%</dd></div>
                                    </dl>
                                );
                            })()}
                            <span className="mon-map-tip-foot">Click to keep this country open</span>
                        </div>
                    )}

                    <div className="mon-map-zoom">
                        <Tooltip title="Zoom in" placement="left"><Button size="small" icon={<PlusOutlined />} onClick={() => zoomBy(1.4)} aria-label="Zoom in" /></Tooltip>
                        <Tooltip title="Zoom out" placement="left"><Button size="small" icon={<MinusOutlined />} onClick={() => zoomBy(1 / 1.4)} aria-label="Zoom out" /></Tooltip>
                        <Tooltip title="Reset" placement="left"><Button size="small" icon={<AimOutlined />} onClick={() => setView({ k: 1, x: 0, y: 0 })} disabled={view.k === 1} aria-label="Reset the map" /></Tooltip>
                    </div>

                    {scale && (
                        <div className="mon-map-legend" aria-hidden="true">
                            <span>{measure === 'speed' ? 'fast' : 'fewer'}</span>
                            <i>{(measure === 'speed' ? SPEED_SHADES : SHADES).map(c => <b key={c} style={{ background: c }} />)}</i>
                            <span>{measure === 'speed' ? 'slow' : 'more'}</span>
                        </div>
                    )}
                </div>
            </section>

            <div className="mon-grid">
                {/* ── The country in focus ── */}
                <section className="mon-card mon-country">
                    <header>
                        <h3>{selected ? 'Country' : 'Pick a country'}</h3>
                        {pinned && <Button size="small" type="text" onClick={() => setPinned(null)}>Clear</Button>}
                    </header>
                    {selected ? (
                        <>
                            <div className="mon-country-head">
                                <span className="mon-country-flag">{flag(selected.country)}</span>
                                <div>
                                    <strong>{selectedName}</strong>
                                    <em>{selected.share}% of all page views in this period</em>
                                </div>
                            </div>
                            <ul className="mon-country-facts">
                                <li><span>Visitors</span><b>{compact(selected.visitors)}</b></li>
                                <li><span>Page views</span><b>{compact(selected.visits)}</b></li>
                                <li><span>Visits</span><b>{compact(selected.sessions)}</b></li>
                                <li><span>Bounce rate</span><b>{selected.bounce_rate}%</b></li>
                                <li><span>Time on page</span><b>{duration(selected.avg_seconds)}</b></li>
                                <li><span>Page load</span><b>{selected.load_p75 ? ms(selected.load_p75) : '—'}</b></li>
                                <li><span>Largest paint</span><b>{selected.lcp_p75 ? ms(selected.lcp_p75) : '—'}</b></li>
                                <li><span>First byte</span><b>{selected.ttfb_p75 ? ms(selected.ttfb_p75) : '—'}</b></li>
                            </ul>
                            <div className="mon-country-split" aria-label="Devices">
                                <span><MobileOutlined /> {Math.round(((selected.phone + selected.tablet) / Math.max(1, selected.visits)) * 100)}% phone or tablet</span>
                                <span><DesktopOutlined /> {Math.round((selected.desktop / Math.max(1, selected.visits)) * 100)}% computer</span>
                            </div>
                            {selected.top_page && <p className="mon-country-page">Most read: <code>{selected.top_page}</code></p>}
                        </>
                    ) : (
                        <p className="mon-none">Hover a country on the map, or click one to keep it here.</p>
                    )}
                </section>

                {/* ── Ranking, which is also the accessible version of the map ── */}
                <section className="mon-card">
                    <header><h3>Top countries</h3><span>by page views</span></header>
                    {ranked.length ? (
                        <ul className="mon-bars">
                            {ranked.map(c => (
                                <li
                                    key={c.country}
                                    className={`is-clickable${pinned === c.country ? ' is-picked' : ''}`}
                                    onClick={() => setPinned(p => (p === c.country ? null : c.country))}
                                    onMouseEnter={() => setPinned(prev => prev ?? null)}
                                >
                                    <span className="mon-bar-fill" style={{ width: `${(c.visits / ranked[0].visits) * 100}%` }} aria-hidden="true" />
                                    <span className="mon-bar-label"><span className="mon-flag">{flag(c.country)}</span>{countryName(c.country)}</span>
                                    <span className="mon-bar-sub">{c.load_p75 ? ms(c.load_p75) : '—'}</span>
                                    <b>{compact(c.visits)}</b>
                                    <em>{c.share}%</em>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="mon-none">No visit has been placed on the map yet.</p>}
                </section>
            </div>
        </div>
    );
};

export default MonitoringMap;
