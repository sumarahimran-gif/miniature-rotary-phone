import React from 'react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface TableProps<T> {
  id?: string;
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
}

export function Table<T>({
  id = 'data-table',
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No records found',
  onRowClick,
  isLoading = false,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div id={`${id}-loading`} className="w-full py-12 flex flex-col items-center justify-center text-[#9A9DA6]">
        <div className="w-5 h-5 border-2 border-[rgba(242,241,237,0.1)] border-t-[#4C63D2] rounded-full animate-spin mb-2" />
        <span className="text-xs">Loading records...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div id={`${id}-empty`} className="w-full py-12 text-center text-xs text-[#9A9DA6] bg-[#16181D] border border-[rgba(242,241,237,0.08)]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div id={id} className="w-full overflow-x-auto border border-[rgba(242,241,237,0.08)] bg-[#16181D]">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-[rgba(242,241,237,0.08)] bg-[#111317] text-xs font-medium text-[#9A9DA6]">
            {columns.map((col, idx) => (
              <th key={idx} scope="col" className={`px-4 py-3 font-normal ${col.headerClassName || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgba(242,241,237,0.08)]">
          {data.map((item) => {
            const key = keyExtractor(item);
            return (
              <tr
                key={key}
                id={`${id}-row-${key}`}
                onClick={() => onRowClick && onRowClick(item)}
                className={`transition-colors ${
                  onRowClick ? 'cursor-pointer hover:bg-[#1C1F26]' : 'hover:bg-[#1C1F26]'
                }`}
              >
                {columns.map((col, colIdx) => {
                  return (
                    <td key={colIdx} className={`px-4 py-3 text-[#F2F1ED] align-middle ${col.className || ''}`}>
                      {col.cell
                        ? col.cell(item)
                        : col.accessorKey
                        ? (item[col.accessorKey] as unknown as React.ReactNode)
                        : null}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
