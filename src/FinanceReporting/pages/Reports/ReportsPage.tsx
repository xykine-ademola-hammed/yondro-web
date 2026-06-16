import { useMemo, useState } from "react";
import { downloadBlob } from "../../utils/download";
import { useAccounts, useUnits } from "../../api/financeHooks";
import { financeApi } from "../../../services/api";

const reportTypes = [
  { key: "cashbook", label: "Cashbook" },
  { key: "trial-balance", label: "Trial Balance" },
  { key: "income-expenditure", label: "Income & Expenditure" },
  { key: "balance-sheet", label: "Balance Sheet" },
] as const;

export default function ReportsPage() {
  const { data: units } = useUnits();
  const [unitId, setUnitId] = useState("");
  const [period, setPeriod] = useState("2026-01");
  const [loading, setLoading] = useState<string | null>(null);

  const { data: accounts } = useAccounts(unitId || undefined);
  const activeAccounts = useMemo(
    () => (accounts?.data ?? []).filter((a: any) => a.status === "ACTIVE"),
    [accounts]
  );

  const [ledgerAccountId, setLedgerAccountId] = useState("");

  async function downloadReport(
    reportType: string,
    extra?: { accountId?: string }
  ) {
    if (!unitId || !period) return;
    setLoading(reportType);
    try {
      const blob = await financeApi.downloadReportPdf({
        unitId,
        period,
        reportType,
        ...(extra ?? {}),
      });
      downloadBlob(blob, `${reportType}-${period}.pdf`);
    } finally {
      setLoading(null);
    }
  }

  async function downloadLedger() {
    await downloadReport("ledger", { accountId: ledgerAccountId || undefined });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-white p-4">
        <h2 className="text-lg font-semibold">Monthly Reports</h2>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="text-xs text-gray-600">Financial Unit</label>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={unitId}
              onChange={(e) => {
                setUnitId(e.target.value);
                setLedgerAccountId("");
              }}
            >
              <option value="">Select unit</option>
              {(units?.data ?? []).map((u: any) => (
                <option key={u.id} value={u.id}>
                  {u.code} - {u.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-600">Period (YYYY-MM)</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="2026-01"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {reportTypes.map((r) => (
          <button
            key={r.key}
            onClick={() => downloadReport(r.key)}
            disabled={!unitId || !period || loading === r.key}
            className="rounded-xl border bg-white p-4 text-left hover:bg-gray-50 disabled:opacity-50"
          >
            <div className="font-semibold">{r.label}</div>
            <div className="text-xs text-gray-600">
              Generate and download PDF for {period}
            </div>
            <div className="mt-2 text-sm">
              {loading === r.key ? "Generating..." : "Download PDF"}
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-xl border bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-semibold">Ledger</div>
            <div className="text-xs text-gray-600">
              Download full ledger or single account ledger
            </div>
          </div>

          <div className="grid w-full grid-cols-1 gap-2 md:w-auto md:grid-cols-[360px_160px]">
            <select
              className="rounded-lg border px-3 py-2 text-sm"
              value={ledgerAccountId}
              onChange={(e) => setLedgerAccountId(e.target.value)}
              disabled={!unitId}
            >
              <option value="">All accounts (full ledger)</option>
              {activeAccounts.map((a: any) => (
                <option key={a.id} value={a.id}>
                  {a.accountCode} - {a.accountName}
                </option>
              ))}
            </select>

            <button
              onClick={downloadLedger}
              disabled={!unitId || !period || loading === "ledger"}
              className="rounded-lg border bg-gray-900 px-3 py-2 text-sm text-white hover:bg-black disabled:opacity-50"
            >
              {loading === "ledger" ? "Generating..." : "Download"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
