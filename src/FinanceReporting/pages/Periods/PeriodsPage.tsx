import { useState } from "react";
import {
  useUnits,
  usePeriods,
  useOpenPeriod,
  useClosePeriod,
  // useClosePeriod,
} from "../../api/financeHooks";
import NewPeriod from "./NewPeriod";
import { formatDate } from "../../../components/lib/utils";

export default function PeriodsPage() {
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const { data: units } = useUnits();
  const [unitId, setUnitId] = useState("");
  const { data: periods, isLoading } = usePeriods(unitId || undefined);

  const openMut = useOpenPeriod(unitId as any);
  const closeMut = useClosePeriod(unitId as any);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-white p-4">
        <h2 className="text-lg font-semibold">Financial Periods</h2>

        <div className="mt-3 justify-between gap-2 md:flex">
          <div>
            <label className="text-xs text-gray-600">Unit</label>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
            >
              <option value="">Select unit</option>
              {(units?.data ?? []).map((u: any) => (
                <option key={u.id} value={u.id}>
                  {u.code} - {u.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              className="w-full rounded-lg border bg-blue-600 px-3 py-2 text-sm text-white hover:bg-black disabled:opacity-50"
              onClick={() => setIsAddEditModalOpen(true)}
            >
              Create New Period
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <h3 className="text-sm font-semibold">Periods</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Period</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Closed At</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-3 py-6 text-center text-gray-600"
                  >
                    Loading...
                  </td>
                </tr>
              ) : (periods?.data ?? []).length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-3 py-6 text-center text-gray-600"
                  >
                    No periods
                  </td>
                </tr>
              ) : (
                (periods?.data ?? []).map((p: any) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-3 py-2">{p.period}</td>
                    <td className="px-3 py-2">
                      <span className="rounded-full border px-2 py-1 text-xs">
                        {p.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">{formatDate(p.closedAt) ?? "-"}</td>
                    <td className="px-3 py-2">
                      {p.status === "OPEN" && (
                        <button
                          className="rounded-lg border bg-blue-600 px-3 py-2 text-sm text-white hover:bg-black disabled:opacity-50"
                          onClick={() => closeMut.mutate(p.id)}
                        >
                          Close Period
                        </button>
                      )}

                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <NewPeriod
        modalMode={"add"}
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSave={(period) => {
          openMut.mutate(period);
        }}
      />
    </div>
  );
}
