import { useMemo, useState } from "react";
import { useUnits, useUpdateUnit } from "../../api/financeHooks";
import type { FinancialUnit } from "../../api/types";
import NewFinanceUnit from "./NewFinanceUnit";

function statusPill(status: string) {
  switch (status) {
    case "ACTIVE":
      return "border-green-200 bg-green-50 text-green-800";
    case "INACTIVE":
      return "border-slate-200 bg-slate-50 text-slate-700";
    default:
      return "border-slate-200 bg-white text-slate-700";
  }
}

export default function UnitsPage() {
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const { data, isLoading } = useUnits();
  const updateMut = useUpdateUnit();

  const units = useMemo(() => data?.data ?? [], [data]);

  async function toggleStatus(u: FinancialUnit) {
    await updateMut.mutateAsync({
      id: u.id,
      payload: { status: u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" },
    });
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 px-3 pb-24 pt-4 sm:px-6 sm:pb-8">
      {/* Header */}
      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
              Financial Units
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Create and manage finance units (e.g., Bursary, Faculty,
              Department).
            </p>
          </div>

          {/* Desktop action */}
          <button
            onClick={() => setIsAddEditModalOpen(true)}
            className="hidden rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-50 sm:inline-flex"
          >
            Add New Unit
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 p-4 text-xs text-slate-500 sm:p-6">
          <div>
            Total:{" "}
            <span className="font-semibold text-slate-900">{units.length}</span>{" "}
            unit{units.length === 1 ? "" : "s"}
          </div>
          <div className="hidden sm:block">
            Tip: Keep unit codes short (e.g., ICT, CHEM, STORE).
          </div>
        </div>
      </div>

      {/* Modal */}
      <NewFinanceUnit
        modalMode={"add"}
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSave={(data) => {
          console.log("data", data);
        }}
      />

      {/* List */}
      <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700" />
              <span className="text-sm font-medium text-slate-600">
                Loading units...
              </span>
            </div>
          </div>
        )}

        {/* Mobile cards */}
        <div className="md:hidden">
          {!isLoading && units.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-3xl">🏢</div>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                No units yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Add your first finance unit to start configuring accounts and
                journals.
              </p>
            </div>
          ) : (
            <div className="space-y-3 p-3">
              {units.map((u: any) => (
                <div
                  key={u.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="truncate text-sm text-slate-700">
                    {u.name}
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="truncate text-sm font-semibold text-slate-900">
                          {u.code}
                        </div>
                      </div>
                    </div>

                    <span
                      className={[
                        "shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold",
                        statusPill(u.status),
                      ].join(" ")}
                    >
                      {u.status}
                    </span>
                  </div>

                  <div className="mt-4 flex justify-between text-sm border-t border-slate-100">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                      Currency: {u.currency}
                    </span>
                    <button
                      className="rounded-xl border px-2 py-1 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
                      onClick={() => toggleStatus(u)}
                      disabled={updateMut.isPending}
                    >
                      {updateMut.isPending
                        ? "Working..."
                        : u.status === "ACTIVE"
                          ? "Deactivate"
                          : "Activate"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4 text-left">Code</th>
                  <th className="px-5 py-4 text-left">Name</th>
                  <th className="px-5 py-4 text-left">Currency</th>
                  <th className="px-5 py-4 text-left">Status</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-10 text-center text-slate-600"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : units.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-10 text-center text-slate-600"
                    >
                      No units
                    </td>
                  </tr>
                ) : (
                  units.map((u: any) => (
                    <tr key={u.id}>
                      <td className="px-5 py-4 font-medium text-slate-900">
                        {u.code}
                      </td>
                      <td className="px-5 py-4 text-slate-700">{u.name}</td>
                      <td className="px-5 py-4 text-slate-700">{u.currency}</td>
                      <td className="px-5 py-4">
                        <span
                          className={[
                            "rounded-full border px-2.5 py-1 text-xs font-semibold",
                            statusPill(u.status),
                          ].join(" ")}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50"
                          onClick={() => toggleStatus(u)}
                          disabled={updateMut.isPending}
                        >
                          {u.status === "ACTIVE" ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile sticky action */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-3">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-800">Units</div>
            <div className="truncate text-xs text-slate-500">
              {units.length} unit{units.length === 1 ? "" : "s"}
            </div>
          </div>

          <button
            onClick={() => setIsAddEditModalOpen(true)}
            className="shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black"
          >
            Add New
          </button>
        </div>
      </div>
    </div>
  );
}
