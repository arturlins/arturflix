import type { ReactNode } from 'react'

export type Column<T> = {
    key: string
    header: string
    align?: 'left' | 'right' | 'center'
    width?: string
    render: (row: T) => ReactNode
}

type Props<T> = {
    rows: T[]
    columns: Column<T>[]
    rowKey: (row: T) => string
    onRowClick?: (row: T) => void
    empty?: ReactNode
}

export function DataTable<T>({ rows, columns, rowKey, onRowClick, empty }: Props<T>) {
    if (rows.length === 0 && empty) return <>{empty}</>

    return (
        <div className="overflow-hidden rounded-xl border border-border bg-surface-2">
            <table className="w-full text-sm">
                <thead className="sticky top-16 z-10 bg-surface-2/95 backdrop-blur-sm">
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                style={col.width ? { width: col.width } : undefined}
                                className={`px-5 h-10 text-[10px] font-medium uppercase tracking-[0.18em] text-foreground-faint border-b border-border ${
                                    col.align === 'right'
                                        ? 'text-right'
                                        : col.align === 'center'
                                          ? 'text-center'
                                          : 'text-left'
                                }`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr
                            key={rowKey(row)}
                            onClick={onRowClick ? () => onRowClick(row) : undefined}
                            className={`group border-b border-border/50 last:border-0 transition-colors ${
                                onRowClick ? 'cursor-pointer hover:bg-surface-3/40' : ''
                            }`}
                        >
                            {columns.map((col, colIdx) => (
                                <td
                                    key={col.key}
                                    className={`relative px-5 py-3.5 text-foreground ${
                                        col.align === 'right'
                                            ? 'text-right'
                                            : col.align === 'center'
                                              ? 'text-center'
                                              : 'text-left'
                                    }`}
                                >
                                    {colIdx === 0 && onRowClick && (
                                        <span
                                            aria-hidden="true"
                                            className="absolute left-0 top-2.5 bottom-2.5 w-[2px] bg-accent rounded-r scale-y-0 group-hover:scale-y-100 transition-transform origin-center"
                                        />
                                    )}
                                    {col.render(row)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
