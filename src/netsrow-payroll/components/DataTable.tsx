import React from 'react';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  stickyLeft?: boolean;
  minWidthClass?: string;
  render: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  selectedRowKey?: string | null;
  onRowClick?: (row: T) => void;
  emptyMessage: string;
  isLoading?: boolean;
  mobileCardRender?: (row: T, isSelected: boolean) => React.ReactNode;
}

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  selectedRowKey,
  onRowClick,
  emptyMessage,
  isLoading = false,
  mobileCardRender,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] overflow-hidden">
        <div className="divide-y divide-[var(--nr-border)]">
          {[0, 1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="h-11 px-4 flex items-center gap-4 animate-pulse"
            >
              <div className="h-3 w-20 rounded bg-[var(--nr-surface-muted)]" />
              <div className="h-3 w-44 rounded bg-[var(--nr-surface-muted)]" />
              <div className="ml-auto h-3 w-24 rounded bg-[var(--nr-surface-muted)]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-8 text-center text-sm text-[var(--nr-text-secondary)]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      {/* Desktop / Tablet horizontal-scroll high-density table */}
      <div
        className={`${
          mobileCardRender ? 'hidden md:block' : 'block'
        } rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] overflow-x-auto`}
      >
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-[var(--nr-surface-muted)] border-b border-[var(--nr-border)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-3.5 py-2.5 text-[11px] font-semibold tracking-wider uppercase text-[var(--nr-text-secondary)] whitespace-nowrap ${
                    col.align === 'right' ? 'text-right' : 'text-left'
                  } ${
                    col.stickyLeft
                      ? 'sticky left-0 z-10 bg-[var(--nr-surface-muted)] border-r border-[var(--nr-border)]'
                      : ''
                  } ${col.minWidthClass ?? ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--nr-border)]">
            {rows.map((row, idx) => {
              const key = getRowKey(row);
              const isSelected = selectedRowKey === key;
              const rowBg = isSelected
                ? 'bg-[var(--nr-success-bg)]'
                : idx % 2 === 1
                  ? 'bg-[var(--nr-surface-elevated)]'
                  : 'bg-[var(--nr-surface)]';

              return (
                <tr
                  key={key}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`nr-transition h-11 ${rowBg} ${
                    onRowClick
                      ? 'cursor-pointer hover:bg-[var(--nr-surface-muted)]'
                      : ''
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-3.5 py-2.5 text-[13px] text-[var(--nr-text)] ${
                        col.align === 'right' ? 'text-right tabular-nums' : 'text-left'
                      } ${
                        col.stickyLeft
                          ? `sticky left-0 z-10 border-r border-[var(--nr-border)] ${
                              isSelected
                                ? 'bg-[var(--nr-success-bg)]'
                                : idx % 2 === 1
                                  ? 'bg-[var(--nr-surface-elevated)]'
                                  : 'bg-[var(--nr-surface)]'
                            }`
                          : ''
                      }`}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards when mobileCardRender is supplied */}
      {mobileCardRender && (
        <div className="md:hidden space-y-2.5">
          {rows.map((row) => {
            const key = getRowKey(row);
            const isSelected = selectedRowKey === key;
            return (
              <div
                key={key}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`nr-transition rounded-xl border p-3.5 ${
                  isSelected
                    ? 'bg-[var(--nr-success-bg)] border-[var(--nr-success-border)]'
                    : 'bg-[var(--nr-surface)] border-[var(--nr-border)]'
                } ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {mobileCardRender(row, isSelected)}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
