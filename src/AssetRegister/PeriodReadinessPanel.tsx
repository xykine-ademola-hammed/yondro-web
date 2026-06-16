import React from "react";
import { usePeriodReadiness, useRunDepreciation } from "./Components/assetHooks";
import { Button, Badge } from "./Components/primitive";

interface PeriodReadinessPanelProps {
  unitType: string;
}

const PeriodReadinessPanel: React.FC<PeriodReadinessPanelProps> = ({ unitType }) => {
  const { data, isLoading, error } = usePeriodReadiness(unitType);
  const runDep = useRunDepreciation();

  const handleRunDepreciation = () => {
    const period = prompt("Run depreciation for period (YYYY-MM):");
    if (!period) return;
    runDep.mutate({ period, unitType });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Period Close Readiness
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Unposted journals + depreciation + trial balance checks.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={handleRunDepreciation}
          disabled={runDep.isPending}
        >
          {runDep.isPending ? "Running…" : "Run Depreciation"}
        </Button>
      </div>

      {isLoading && (
        <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
          <div className="h-4 w-4 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin" />
          Loading readiness…
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {String((error as any)?.message || error)}
        </div>
      )}

      {data && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Unposted Journals</th>
                <th className="px-4 py-3 text-center">Depreciation</th>
                <th className="px-4 py-3 text-center">Trial Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {/* Note: data is now expected to be a single PeriodReadiness object or an array based on API. 
                  The previous code treated data as an array. I'll check my usePeriodReadiness hook.
                  Actually, my hook expects a single PeriodReadiness. I'll adjust to handle both just in case.
              */}
              {(Array.isArray(data) ? data : [data]).map((p) => (
                <tr key={p.period} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {p.period}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={p.status === "OPEN" ? "green" : "gray"}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {p.unpostedJournalCount > 0 ? (
                      <Badge tone="yellow">{p.unpostedJournalCount}</Badge>
                    ) : (
                      <Badge tone="green">0</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge
                      tone={
                        p.depreciation.status === "POSTED"
                          ? "green"
                          : p.depreciation.status === "DRAFT"
                            ? "yellow"
                            : "red"
                      }
                    >
                      {p.depreciation.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge tone={p.trialBalance.balanced ? "green" : "red"}>
                      {p.trialBalance.balanced ? "Balanced" : "Not Balanced"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PeriodReadinessPanel;
