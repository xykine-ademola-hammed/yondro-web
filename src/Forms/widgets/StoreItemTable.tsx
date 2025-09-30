import React from "react";

type TableColumn<RowType> = {
  label: string;
  field: keyof RowType;
  renderCell?: (
    value: any,
    row: RowType,
    rowIndex: number,
    onChange: (value: any) => void,
    disabled: boolean
  ) => React.ReactNode;
  isDisabled?: (row: RowType, rowIndex: number) => boolean;
};

type GenericTableProps<RowType extends { id?: string | number }> = {
  columns: TableColumn<RowType>[];
  rows: RowType[];
  onCellChange: (
    field: keyof RowType,
    value: any,
    rowIndex: number,
    row: RowType
  ) => void;
  onAddRow?: () => void;
  canAddRow?: boolean;
  addRowLabel?: string;
  className?: string;
};

function GenericTable<RowType extends { id?: string | number }>({
  columns,
  rows,
  onCellChange,
  onAddRow,
  canAddRow = false,
  addRowLabel = "Add row",
  className = "",
}: GenericTableProps<RowType>) {
  return (
    <div
      className={`bg-white shadow rounded-lg mb-6 overflow-hidden ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.field.toString()}
                  className="px-3 py-1 text-left text-xs text-gray-500 border-b border-gray-200"
                  style={idx === 0 ? { minWidth: 180 } : {}}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row, rowIndex) => (
              <tr key={row.id ?? rowIndex} className="divide-x divide-gray-200">
                {columns.map((col, _colIndex) => {
                  const value = row[col.field];
                  const disabled = col.isDisabled
                    ? col.isDisabled(row, rowIndex)
                    : false;
                  return (
                    <td className="p-0" key={col.field.toString()}>
                      {col.renderCell ? (
                        col.renderCell(
                          value,
                          row,
                          rowIndex,
                          (val) => onCellChange(col.field, val, rowIndex, row),
                          disabled
                        )
                      ) : (
                        <input
                          type="text"
                          value={
                            typeof value === "string" ||
                            typeof value === "number"
                              ? value
                              : ""
                          }
                          disabled={disabled}
                          onChange={(e) =>
                            onCellChange(
                              col.field,
                              e.target.value,
                              rowIndex,
                              row
                            )
                          }
                          className="w-full p-1 border-0 focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {canAddRow && onAddRow ? (
          <button
            type="button"
            onClick={onAddRow}
            className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-200"
          >
            {addRowLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default GenericTable;

/*
===== USAGE EXAMPLE =====

import GenericTable from "./StoreItemGenericTable";

const storeColumns = [
  {
    label: "Articles",
    field: "articles",
    renderCell: (val, row, idx, onChange, disabled) => (
        <textarea
            rows={1}
            value={val ?? ""}
            disabled={disabled}
            onChange={e => onChange(e.target.value)}
            className="w-full p-1 border-0 focus:ring-2 focus:ring-blue-500 text-sm"
        />
    ),
    isDisabled: (_row, _idx) => false,
  },
  {
    label: "Denomination Qty.",
    field: "denominationOfQty",
    // ... (same idea for other columns, or use default input)
  },
  // ... repeat for all fields ...
];

<GenericTable
  columns={storeColumns}
  rows={storeItems}
  onCellChange={(field, value, rowIndex, row) => {
    // your handler here
  }}
  onAddRow={yourAddRowFunction}
  canAddRow={vissibleSections?.includes("addMore")}
  addRowLabel="Add row"
/>

*/
