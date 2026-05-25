import React from 'react';
import useResponsive from '../../hooks/useResponsive';

/**
 * Shared page-header used by Student (and reusable by Teacher/Admin).
 *
 * Renders a clean title + subtitle row with optional right-side actions
 * and a slot for a "context strip" (timezone hint, filter pills, etc.).
 *
 * Sizes scale automatically with the viewport so a 14" 1080p screen does
 * not waste space on hero-sized titles meant for 2K monitors.
 */
export interface PageHeaderProps {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    actions?: React.ReactNode;
    /** Small chip/badge row rendered below the subtitle. */
    contextStrip?: React.ReactNode;
    icon?: React.ReactNode;
    /** Visual accent for the icon tile. Defaults to indigo. */
    accent?: string;
    /** Reduce bottom margin (used inside tab panels). */
    dense?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({
    title, subtitle, actions, contextStrip, icon, accent = '#4338ca', dense = false,
}) => {
    const r = useResponsive();
    const titleSize = r.isMobile ? 18 : r.isLaptop ? 19 : r.isSmallDesktop ? 20 : 22;
    const subtitleSize = r.isMobile ? 12 : 13;
    const iconTile = r.isMobile ? 36 : r.isLaptop ? 38 : 42;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: dense ? 12 : (r.isMobile ? 16 : 20),
            flexWrap: 'wrap',
        }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, minWidth: 0, flex: 1 }}>
                {icon && (
                    <div style={{
                        width: iconTile, height: iconTile, borderRadius: 12,
                        background: accent + '18',
                        color: accent,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: r.isMobile ? 18 : 20,
                        flexShrink: 0,
                    }}>
                        {icon}
                    </div>
                )}
                <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                        fontSize: titleSize,
                        fontWeight: 800,
                        color: '#0f172a',
                        letterSpacing: -0.3,
                        lineHeight: 1.25,
                    }}>
                        {title}
                    </div>
                    {subtitle && (
                        <div style={{
                            fontSize: subtitleSize,
                            color: '#64748b',
                            marginTop: 4,
                            lineHeight: 1.5,
                        }}>
                            {subtitle}
                        </div>
                    )}
                    {contextStrip && (
                        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                            {contextStrip}
                        </div>
                    )}
                </div>
            </div>
            {actions && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {actions}
                </div>
            )}
        </div>
    );
};

export default PageHeader;
