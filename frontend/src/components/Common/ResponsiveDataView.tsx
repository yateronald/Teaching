import React from 'react';
import { Table } from 'antd';
import type { TableProps } from 'antd';
import useResponsive from '../../hooks/useResponsive';

/**
 * ResponsiveDataView
 *
 * Renders a regular Ant Design `<Table>` on desktop / tablet, but on mobile
 * (< 768px) collapses each row into a card stack.
 *
 * Why: horizontal-scrolling tables are unprofessional on phones — long rows
 * either get cut off or force the user into rubber-banding side-scroll.
 * The card layout uses the `mobileRender` prop to give each row a custom
 * compact card representation, with the most important fields surfaced
 * first and the rest collapsed behind a chevron.
 *
 * Usage:
 *   <ResponsiveDataView<MyRow>
 *     columns={...}
 *     dataSource={...}
 *     rowKey="id"
 *     mobileRender={(row) => (
 *       <div>
 *         <div className="title">{row.title}</div>
 *         <div className="meta">{row.batch_name}</div>
 *       </div>
 *     )}
 *     onRowClick={(row) => openDetails(row)}
 *   />
 */
export interface ResponsiveDataViewProps<T> extends Omit<TableProps<T>, 'onRow'> {
    /** Custom card content for each row at mobile breakpoint. */
    mobileRender: (row: T, index: number) => React.ReactNode;
    /** Optional click handler — applies on both desktop rows and mobile cards. */
    onRowClick?: (row: T) => void;
    /** Empty state shown when there are no items at any breakpoint. */
    emptyText?: React.ReactNode;
    /** Pull-up action area for the mobile cards (e.g. quick filters). */
    mobileHeader?: React.ReactNode;
    /** Spacing between mobile cards (default 10). */
    mobileGap?: number;
}

function ResponsiveDataView<T extends Record<string, any>>({
    columns,
    dataSource,
    rowKey,
    mobileRender,
    onRowClick,
    emptyText,
    mobileHeader,
    mobileGap = 10,
    pagination,
    loading,
    scroll,
    size,
    ...rest
}: ResponsiveDataViewProps<T>) {
    const r = useResponsive();

    if (r.isMobile) {
        // ── Mobile: stack of cards ───────────────────────────────────────
        const items = (dataSource as T[]) ?? [];
        const keyOf = (item: T, i: number) =>
            typeof rowKey === 'function'
                ? rowKey(item, i)
                : (rowKey ? item[rowKey as string] : i);

        return (
            <div>
                {mobileHeader && <div style={{ marginBottom: mobileGap }}>{mobileHeader}</div>}
                {items.length === 0 ? (
                    <div style={{
                        padding: '40px 20px',
                        textAlign: 'center',
                        color: '#94a3b8',
                        fontSize: 13,
                        background: '#fafbff',
                        borderRadius: 12,
                        border: '1px dashed #e2e8f0',
                    }}>
                        {emptyText ?? 'No items to display'}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: mobileGap }}>
                        {items.map((row, i) => (
                            <div
                                key={keyOf(row, i) as React.Key}
                                onClick={onRowClick ? () => onRowClick(row) : undefined}
                                style={{
                                    background: '#fff',
                                    border: '1px solid #f0f0f8',
                                    borderRadius: 14,
                                    padding: 14,
                                    boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
                                    cursor: onRowClick ? 'pointer' : 'default',
                                    transition: 'all 0.18s ease',
                                }}
                            >
                                {mobileRender(row, i)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // ── Tablet / desktop: standard table ─────────────────────────────────
    return (
        <Table<T>
            columns={columns}
            dataSource={dataSource}
            rowKey={rowKey}
            pagination={pagination}
            loading={loading}
            scroll={scroll}
            size={r.isCompact ? 'small' : (size as TableProps<T>['size'])}
            onRow={onRowClick ? (record) => ({
                onClick: () => onRowClick(record),
                style: { cursor: 'pointer' },
            }) : undefined}
            {...rest}
        />
    );
}

export default ResponsiveDataView;
