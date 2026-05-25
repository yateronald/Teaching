import React, { useEffect, useMemo, useState } from 'react';
import { Select, Spin } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import type { TimezoneGroup } from '../../utils/timezone';
import { detectBrowserTimezone } from '../../utils/timezone';

interface Props {
    value?: string;
    onChange?: (tz: string) => void;
    placeholder?: string;
    style?: React.CSSProperties;
    size?: 'small' | 'middle' | 'large';
}

/**
 * Searchable timezone dropdown grouped by region. Loads the catalog from
 * GET /api/auth/timezones (cached for the session) and shows a "Detected:
 * <browser zone>" hint below the field if it differs from the saved value.
 */
const TimezoneSelect: React.FC<Props> = ({ value, onChange, placeholder, style, size = 'middle' }) => {
    const { apiCall } = useAuth();
    const [groups, setGroups] = useState<TimezoneGroup[]>([]);
    const [loading, setLoading] = useState(false);
    const browserTz = useMemo(() => detectBrowserTimezone(), []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const r = await apiCall('/auth/timezones');
                if (!cancelled && r.ok) {
                    const data = await r.json();
                    setGroups(data.groups || []);
                }
            } catch {
                // ignore — keep empty list, user can still type
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [apiCall]);

    const options = useMemo(() => groups.map(g => ({
        label: g.label,
        title: g.label,
        options: g.zones.map(z => ({ value: z.value, label: z.label })),
    })), [groups]);

    const showDetectHint = browserTz && value && browserTz !== value;

    return (
        <div style={style}>
            <Select
                showSearch
                value={value}
                onChange={(v) => onChange?.(v)}
                size={size}
                placeholder={placeholder || 'Select your timezone'}
                suffixIcon={loading ? <Spin size="small" /> : <GlobalOutlined />}
                options={options}
                optionFilterProp="label"
                filterOption={(input, option) => {
                    // Antd passes either group (with `options`) or leaf option here.
                    // Group nodes don't carry a value — only leaves do.
                    if (!option) return false;
                    const label = typeof option.label === 'string' ? option.label : '';
                    const value = 'value' in option && typeof option.value === 'string' ? option.value : '';
                    const q = input.toLowerCase();
                    return label.toLowerCase().includes(q) || value.toLowerCase().includes(q);
                }}
                style={{ width: '100%', height: size === 'large' ? 44 : undefined, borderRadius: 10 }}
                popupMatchSelectWidth={false}
                listHeight={320}
            />
            {showDetectHint && (
                <div style={{ marginTop: 6, fontSize: 11, color: '#94a3b8' }}>
                    Detected: <button
                        type="button"
                        onClick={() => onChange?.(browserTz)}
                        style={{
                            border: 'none', background: 'transparent',
                            color: '#4338ca', fontWeight: 600, cursor: 'pointer',
                            padding: 0, fontSize: 11,
                        }}
                    >{browserTz}</button> — click to use
                </div>
            )}
        </div>
    );
};

export default TimezoneSelect;
