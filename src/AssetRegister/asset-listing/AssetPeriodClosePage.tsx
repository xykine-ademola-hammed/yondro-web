import React, { useState } from "react";
import { useRunDepreciation } from "../Components/assetHooks";
import { Button, Input } from "../Components/primitive";
import { downloadFile } from "../Components/utils";

const API_BASE = import.meta.env.VITE_API_URL + "api";

interface AssetPeriodClosePageProps {
  unitType: string;
}

const AssetPeriodClosePage: React.FC<AssetPeriodClosePageProps> = ({ unitType }) => {
  const [period, setPeriod] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  });

  const runDep = useRunDepreciation();

  const handleDownloadSummary = () => {
    const filename = `depreciation-summary-${period}.pdf`;
    downloadFile(
      `${API_BASE}/assets/reports/depreciation-summary.pdf?unitType=${unitType}&period=${period}`,
      filename,
      true
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Month-End: Assets
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Execute depreciation runs and verify readiness for period closure.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600 uppercase tracking-wider">
              Target Period
            </label>
            <Input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="primary"
              onClick={() => runDep.mutate({ period, unitType })}
              disabled={runDep.isPending}
              className="w-full h-[42px]"
            >
              {runDep.isPending ? "Running Depreciation…" : "Run Depreciation"}
            </Button>
          </div>
          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={handleDownloadSummary}
              className="w-full h-[42px]"
            >
              Download Summary PDF
            </Button>
          </div>
        </div>

        {runDep.isError && (
          <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <p className="font-semibold text-rose-800">Depreciation run failed</p>
            <p className="mt-1">{String((runDep.error as any)?.message || runDep.error)}</p>
          </div>
        )}

        {runDep.isSuccess && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <div className="flex items-center gap-2">
              <span className="text-lg">✅</span>
              <p className="font-semibold">Success</p>
            </div>
            <p className="mt-1">Depreciation run for period {period} has been completed successfully.</p>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <span className="text-xl">👉</span>
          Next Steps for Month-End
        </h3>
        <div className="mt-3 text-sm text-slate-600 space-y-3 leading-relaxed">
          <p>
            1. Once depreciation is <span className="font-semibold text-slate-900 px-1 py-0.5 bg-slate-100 rounded">POSTED</span>,
            the asset sub-ledger is locked for this period.
          </p>
          <p>
            2. Verify that the <span className="font-semibold text-slate-900 border-b border-slate-200">Trial Balance</span> is balanced
            and that all generated journal entries are posted.
          </p>
          <p>
            3. Finally, proceed to the Finance module main page to close the accounting period.
            The system will automatically prevent closure if there are unposted Journals or unfinished Depreciation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssetPeriodClosePage;
