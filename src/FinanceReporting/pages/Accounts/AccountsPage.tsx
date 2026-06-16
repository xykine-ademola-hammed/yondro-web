import { useMemo, useState } from "react";
import {
  useUnits,
  useAccounts,
  useUpdateAccount,
} from "../../api/financeHooks";
import type { GLAccount } from "../../api/types";
import NewFinanceAccount from "./NewFinanceAccount";

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

export default function AccountsPage() {
  const { data: units } = useUnits();
  const [unitId, setUnitId] = useState("");

  const { data: accounts, isLoading } = useAccounts(unitId || undefined);
  const updateMut = useUpdateAccount(unitId as any);

  const list = useMemo(() => accounts?.data ?? [], [accounts]);

  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);

  async function toggleActive(a: GLAccount) {
    await updateMut.mutateAsync({
      id: a.id,
      payload: { status: a.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" },
    });
  }

  const canAdd = Boolean(unitId);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 px-3 pb-24 pt-4 sm:px-6 sm:pb-8">
      {/* Header / Controls */}
      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
              Institution Accounts
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Select a unit to view and manage GL accounts.
            </p>
          </div>

          {/* Desktop action */}
          <button
            onClick={() => setIsAddEditModalOpen(true)}
            // disabled={!canAdd}
            className="hidden rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-50 sm:inline-flex"
          >
            Add New Account
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 p-4 sm:p-6 md:grid-cols-3 md:items-end">
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-slate-700">Unit</label>
            <select
              className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
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
            {!unitId && (
              <div className="mt-1 text-xs text-slate-500">
                Choose a unit to load accounts.
              </div>
            )}
          </div>

          <div className="hidden md:block text-right text-xs text-slate-500">
            {unitId ? (
              <>
                Showing{" "}
                <span className="font-semibold text-slate-900">
                  {list.length}
                </span>{" "}
                account{list.length === 1 ? "" : "s"}
              </>
            ) : (
              "—"
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <NewFinanceAccount
        modalMode={"add"}
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSave={(data) => {
          console.log("data", data);
        }}
      />

      {/* Results */}
      <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700" />
              <span className="text-sm font-medium text-slate-600">
                Loading accounts...
              </span>
            </div>
          </div>
        )}

        {/* Mobile cards */}
        <div className="md:hidden">
          {!unitId ? (
            <div className="p-6 text-center">
              <div className="text-3xl">🏦</div>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                Select a unit
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Choose a unit to view its accounts.
              </p>
            </div>
          ) : !isLoading && list.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-3xl">📭</div>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                No accounts
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Add your first account for this unit.
              </p>
            </div>
          ) : (
            <div className="space-y-3 p-3">
              {list.map((a: any) => (
                <div
                  key={a.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="truncate text-sm text-slate-700">
                    {a.accountName}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-sm font-semibold text-slate-900">
                      {a.accountCode}
                    </div>

                    <span
                      className={[
                        "shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold",
                        statusPill(a.status),
                      ].join(" ")}
                    >
                      {a.status}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3 text-xs mt-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                      {a.accountType}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                      Normal: {a.normalBalance}
                    </span>
                  </div>

                  <div className="mt-4 flex justify-between border-t border-slate-100 pt-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                      Cash: {a.isCash ? "Yes" : "No"}
                    </span>
                    <button
                      className="rounded-xl border px-2 py-1 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
                      onClick={() => toggleActive(a)}
                      disabled={updateMut.isPending}
                    >
                      {updateMut.isPending
                        ? "Working..."
                        : a.status === "ACTIVE"
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
                  <th className="px-5 py-4 text-left">Type</th>
                  <th className="px-5 py-4 text-left">Normal</th>
                  <th className="px-5 py-4 text-left">Cash</th>
                  <th className="px-5 py-4 text-left">Status</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {!unitId ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-10 text-center text-slate-600"
                    >
                      Select a unit to view accounts.
                    </td>
                  </tr>
                ) : isLoading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-10 text-center text-slate-600"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : list.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-10 text-center text-slate-600"
                    >
                      No accounts
                    </td>
                  </tr>
                ) : (
                  list.map((a: any) => (
                    <tr key={a.id}>
                      <td className="px-5 py-4 font-medium text-slate-900">
                        {a.accountCode}
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        {a.accountName}
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        {a.accountType}
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        {a.normalBalance}
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        {a.isCash ? "Yes" : "No"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={[
                            "rounded-full border px-2.5 py-1 text-xs font-semibold",
                            statusPill(a.status),
                          ].join(" ")}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50"
                          onClick={() => toggleActive(a)}
                          disabled={updateMut.isPending}
                        >
                          {a.status === "ACTIVE" ? "Deactivate" : "Activate"}
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
            <div className="text-xs font-semibold text-slate-800">Accounts</div>
            <div className="truncate text-xs text-slate-500">
              {unitId
                ? `${list.length} account${list.length === 1 ? "" : "s"}`
                : "Select a unit"}
            </div>
          </div>

          <button
            onClick={() => setIsAddEditModalOpen(true)}
            disabled={!canAdd}
            className="shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black disabled:opacity-50"
          >
            Add New
          </button>
        </div>
      </div>
    </div>
  );
}
