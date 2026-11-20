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
      <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {[0, 1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="h-11 px-4 flex items-center gap-4 animate-pulse"
            >
              <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-3 w-44 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="ml-auto h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 text-center text-sm text-slate-500 dark:text-slate-400">
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
        } rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-x-auto`}
      >
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-300 dark:border-slate-700">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-3 py-2.5 text-[11px] font-semibold tracking-wider uppercase text-slate-600 dark:text-slate-300 whitespace-nowrap ${
                    col.align === 'right' ? 'text-right' : 'text-left'
                  } ${
                    col.stickyLeft
                      ? 'sticky left-0 z-10 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700'
                      : ''
                  } ${col.minWidthClass ?? ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {rows.map((row, idx) => {
              const key = getRowKey(row);
              const isSelected = selectedRowKey === key;
              const rowBg = isSelected
                ? 'bg-emerald-50/80 dark:bg-emerald-950/35'
                : idx % 2 === 1
                  ? 'bg-slate-50/50 dark:bg-slate-900/60'
                  : 'bg-white dark:bg-slate-900';

              return (
                <tr
                  key={key}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`h-10 transition-colors ${rowBg} ${
                    onRowClick
                      ? 'cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800/70'
                      : ''
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-3 py-2 text-[13px] text-slate-800 dark:text-slate-200 ${
                        col.align === 'right' ? 'text-right' : 'text-left'
                      } ${
                        col.stickyLeft
                          ? `sticky left-0 z-10 border-r border-slate-200 dark:border-slate-700 ${
                              isSelected
                                ? 'bg-emerald-50 dark:bg-emerald-950'
                                : idx % 2 === 1
                                  ? 'bg-slate-50 dark:bg-slate-900'
                                  : 'bg-white dark:bg-slate-900'
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
                className={`rounded-md border p-3.5 transition-colors ${
                  isSelected
                    ? 'bg-emerald-50/70 border-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-700'
                    : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700'
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
