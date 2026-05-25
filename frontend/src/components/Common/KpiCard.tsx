import React from 'react';
import { RightOutlined } from '@ant-design/icons';
import useResponsive from '../../hooks/useResponsive';

/**
 * Shared KPI card.
 *
 * Replaces the half-dozen near-identical local copies that lived in each
 * Student/Teacher/Admin page. Density is read from the viewport so the
 * whole platform stays visually consistent across breakpoints — no need
 * to thread a `density` prop through every consumer.
 *
 * - On compact viewports (< 1280px) the card uses a tighter layout: 38px
 *   icon tile, 14/22 type scale, and 12/14 padding.
 * - On comfortable viewports (≥ 1440px) it expands to 46px icon tile,
 *   16/26 type scale, and 18/22 padding.
 * - In between we use the cozy default.
 */
export interface KpiCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    accent: string;
    /** Small text shown beneath the value (optional). */
    sub?: string;
    /** Inline suffix for the value (e.g. "%" or "pts"). */
    suffix?: string;
    /** When provided, the card becomes clickable and shows a chevron. */
    onClick?: () => void;
    /** Override the auto-detected density. */
    density?: 'compact' | 'cozy' | 'comfortable';
}

const KpiCard: React.FC<KpiCardProps> = ({
    label, value, icon, accent, sub, suffix = '', onClick, density: densityProp,
}) => {
    const r = useResponsive();
    const density = densityProp ?? (r.isDesktop ? 'comfortable' : r.isSmallDesktop ? 'cozy' : 'compact');

    const tile = density === 'comfortable' ? 46 : density === 'cozy' ? 42 : 38;
    const radius = density === 'comfortable' ? 13 : 11;
    const valueSize = density === 'comfortable' ? 26 : density === 'cozy' ? 23 : 21;
    const labelSize = density === 'comfortable' ? 11 : 10.5;
    const padding = density === 'comfortable' ? '18px 22px' : density === 'cozy' ? '15px 18px' : '12px 14px';
    const gap = density === 'comfortable' ? 16 : 12;

    return (
        <div
            onClick={onClick}
            style={{
                borderRadius: 14,
                padding,
                background: '#fff',
                border: '1px solid #f0f0f8',
                boxShadow: '0 2px 12px rgba(99,102,241,0.07)',
                display: 'flex',
                alignItems: 'center',
                gap,
                cursor: onClick ? 'pointer' : 'default',
                transition: 'box-shadow 0.18s, transform 0.18s',
                height: '100%',
                minWidth: 0,
            }}
            onMouseEnter={e => {
                if (onClick) {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(99,102,241,0.16)';
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
                }
            }}
            onMouseLeave={e => {
                if (onClick) {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(99,102,241,0.07)';
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                }
            }}
        >
            <div style={{
                width: tile, height: tile, borderRadius: radius,
                background: accent + '18',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: density === 'comfortable' ? 20 : 18,
                color: accent,
                flexShrink: 0,
            }}>{icon}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                    fontSize: labelSize, fontWeight: 700, color: '#94a3b8',
                    textTransform: 'uppercase', letterSpacing: 0.6,
                    marginBottom: 3,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{label}</div>
                <div style={{
                    fontSize: valueSize, fontWeight: 800, color: '#1a1d2e',
                    lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                    {value}
                    {suffix && (
                        <span style={{ fontSize: density === 'comfortable' ? 13 : 12, fontWeight: 600, color: '#94a3b8', marginLeft: 3 }}>
                            {suffix}
                        </span>
                    )}
                </div>
                {sub && (
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{sub}</div>
                )}
            </div>
            {onClick && <RightOutlined style={{ marginLeft: 'auto', color: '#c7d2fe', fontSize: 11, flexShrink: 0 }} />}
        </div>
    );
};

export default KpiCard;
