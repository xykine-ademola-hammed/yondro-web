import { useState } from "react";
import clsx from "clsx";
import { Menu } from "./ui/Menu";
import { PaginationFooter, type PaginationProps } from "./PaginationFooter";

export interface ColumnDef<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export interface ActionsMenuItem<T> {
  label: string;
  icon?: string;
  onClick: (row: T) => void;
}

export interface DataGridProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;

  search?: string;
  onSearch?: (value: string) => void;

  serverSide?: boolean;
  onSort?: (field: string, direction: "asc" | "desc" | null) => void;

  selectableRows?: boolean;
  expandableRows?: boolean;

  actions?: ActionsMenuItem<T>[];

  pagination?: PaginationProps;
}

export function DataGrid<T>({
  columns,
  data,
  loading = false,
  onSearch,
  onSort,
  actions,
  pagination,
}: DataGridProps<T>) {
  const [sort, setSort] = useState<{
    field: string;
    dir: "asc" | "desc" | null;
  }>({
    field: "",
    dir: null,
  });

  const toggleSort = (field: string) => {
    let dir: "asc" | "desc" | null = "asc";
    if (field === sort.field) {
      if (sort.dir === "asc") dir = "desc";
      else if (sort.dir === "desc") dir = null;
    }
    setSort({ field, dir });
    onSort?.(field, dir);
  };

  return (
    <div>
      {/* Top Bar: Search */}
      {onSearch && (
        <div className="mb-4 flex items-center">
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>
      )}

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {data.map((row: any, idx) => (
          <div key={idx} className="rounded-lg border p-4 shadow-sm">
            {columns.map((col) => (
              <div key={col.key} className="mb-2">
                <div className="text-xs font-semibold text-slate-500">
                  {col.header}
                </div>
                <div className="text-sm">
                  {col.render ? col.render(row) : row[col.key]}
                </div>
              </div>
            ))}

            {/* Row Actions */}
            {actions && (
              <div className="mt-4 flex gap-2">
                {actions.map((a, i) => (
                  <button
                    key={i}
                    onClick={() => a.onClick(row)}
                    className="rounded-md border px-3 py-1 text-sm"
                  >
                    {a.icon && <i className={`fa ${a.icon} mr-2`} />}
                    {a.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-hidden rounded-xl border">
        <div className="max-h-[70vh] overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-50 uppercase text-xs text-slate-600">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={clsx("px-4 py-3 cursor-pointer", col.className)}
                    onClick={() => col.sortable && toggleSort(col.key)}
                  >
                    {col.header}
                    {col.sortable && sort.field === col.key && (
                      <i
                        className={clsx(
                          "ml-1 fa-solid",
                          sort.dir === "asc" && "fa-arrow-up",
                          sort.dir === "desc" && "fa-arrow-down"
                        )}
                      />
                    )}
                  </th>
                ))}

                {actions && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length + (actions ? 1 : 0)}
                    className="p-4 text-center"
                  >
                    Loading...
                  </td>
                </tr>
              ) : (
                data.map((row: any, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}

                    {/* Actions Dropdown */}
                    {actions && (
                      <td className="px-4 py-3 text-right">
                        <Menu actions={actions} row={row} />
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && <PaginationFooter {...pagination} />}
      </div>
    </div>
  );
}
