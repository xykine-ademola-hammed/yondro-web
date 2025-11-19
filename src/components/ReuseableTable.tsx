import React from "react";
import clsx from "clsx";

export interface ColumnDef<T> {
  header: string | React.ReactNode;
  key: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface ReusableTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isSelectableRow?: boolean;
  isExpandable?: boolean;
  isSelectAll?: boolean;
  expandedRowRender?: (row: T) => React.ReactNode;
  selectedRowIds?: number[];
  onToggleSelect?: (id: number) => void;
  onToggleSelectAll?: () => void;
  pagination?: PaginationProps;
  rowKey?: (row: T) => string | number;
}

export function ReusableTable<T>({
  columns,
  data,
  isSelectableRow = false,
  isExpandable = false,
  isSelectAll = false,
  expandedRowRender,
  selectedRowIds = [],
  onToggleSelect,
  onToggleSelectAll,
  pagination,
  rowKey = (row: any) => row.id,
}: ReusableTableProps<T>) {
  return (
    <div className="mt-6 hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
      <div className="max-h-[70vh] overflow-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase text-slate-600 ring-1 ring-slate-200">
            <tr>
              {isSelectableRow && (
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={isSelectAll}
                    onChange={onToggleSelectAll}
                  />
                </th>
              )}

              {columns.map((col) => (
                <th key={col.key} className={clsx("px-4 py-3", col.className)}>
                  {col.header}
                </th>
              ))}

              {isExpandable && <th className="px-4 py-3"></th>}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {data.map((row) => {
              const id = rowKey(row);
              const isSelected = selectedRowIds.includes(Number(id));

              return (
                <React.Fragment key={id}>
                  <tr className="hover:bg-slate-50">
                    {isSelectableRow && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={isSelected}
                          onChange={() => onToggleSelect?.(Number(id))}
                        />
                      </td>
                    )}

                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={clsx("px-4 py-3", col.className)}
                      >
                        {col.render ? col.render(row) : (row as any)[col.key]}
                      </td>
                    ))}

                    {isExpandable && expandedRowRender && (
                      <td className="px-4 py-3 text-right">
                        <button className="text-slate-600 hover:text-slate-900">
                          <i className="fas fa-chevron-down" />
                        </button>
                      </td>
                    )}
                  </tr>

                  {expandedRowRender && (
                    <tr>
                      <td
                        colSpan={
                          columns.length +
                          (isSelectableRow ? 1 : 0) +
                          (isExpandable ? 1 : 0)
                        }
                      >
                        {expandedRowRender(row)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && (
        <div className="border-t border-slate-200 px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing <span className="font-medium">{data.length}</span> of{" "}
            <span className="font-medium">{pagination.total}</span> items
          </p>

          <div className="inline-flex items-center gap-1">
            <PageBtn
              onClick={() => pagination.onPageChange(1)}
              disabled={pagination.page === 1}
              icon="fa-angles-left"
            />
            <PageBtn
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              icon="fa-chevron-left"
            />

            <span className="mx-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <PageBtn
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              icon="fa-chevron-right"
            />
            <PageBtn
              onClick={() => pagination.onPageChange(pagination.totalPages)}
              disabled={pagination.page === pagination.totalPages}
              icon="fa-angles-right"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/** Reusable Page Button */
function PageBtn({ icon, ...rest }: any) {
  return (
    <button
      {...rest}
      className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-600 disabled:opacity-40"
    >
      <i className={`fa ${icon}`} />
    </button>
  );
}
