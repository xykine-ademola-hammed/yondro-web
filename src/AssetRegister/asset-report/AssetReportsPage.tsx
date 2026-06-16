import React, { useState } from "react";
import {
  useReportListing,
  useReportValuation,
  useReportDepSummary
} from "../Components/assetHooks";
import { Badge, Button, Input } from "../Components/primitive";
import { formatMoney, statusTone, downloadFile } from "../Components/utils";
import type { UUID } from "../Components/types";

const API_BASE = import.meta.env.VITE_API_URL + "api";

interface AssetReportsPageProps {
  unitType: string;
}

const AssetReportsPage: React.FC<AssetReportsPageProps> = ({ unitType }) => {
  const [period, setPeriod] = useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  });

  const listing = useReportListing(unitType as UUID);
  const valuation = useReportValuation(unitType as UUID);
  const dep = useReportDepSummary(unitType as UUID, period);

  const handleDownload = (reportType: "listing" | "valuation" | "depreciation-summary", filename: string) => {
    const periodParam = reportType === "depreciation-summary" ? `&period=${period}` : "";
    downloadFile(`${API_BASE}/assets/reports/${reportType}.pdf?unitType=${unitType}${periodParam}`, filename, true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <h1 className="text-2xl font-bold text-slate-900">Asset Reports</h1>
          <p className="mt-1 text-sm text-slate-500 leading-relaxed">
            Generate and export comprehensive reports for auditing, financial reconciliation, and month-end closing processes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="min-w-[160px]">
            <label className="mb-1.5 block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Report Period
            </label>
            <Input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-white"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              className="bg-white"
              onClick={() => handleDownload("listing", `asset-listing-${unitType}.pdf`)}
            >
              Listing PDF
            </Button>
            <Button
              variant="secondary"
              className="bg-white"
              onClick={() => handleDownload("valuation", `asset-valuation-${unitType}.pdf`)}
            >
              Valuation PDF
            </Button>
            <Button
              variant="primary"
              onClick={() => handleDownload("depreciation-summary", `depreciation-summary-${period}.pdf`)}
            >
              Dep Summary PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ReportBlock
          title="Asset Listing Preview"
          subtitle="Recent additions and status overview"
          loading={listing.isLoading}
          error={listing.error}
        >
          <MiniTable
            columns={[
              "Asset Tag",
              "Name",
              "Category",
              "Cost",
              "Acc Dep",
              "NBV",
              "Status",
            ]}
            rows={(listing.data || []).slice(0, 10).map((r) => [
              <span className="font-semibold text-slate-900">{r.assetTag}</span>,
              r.name,
              r.categoryName,
              <span className="tabular-nums">{formatMoney(r.cost)}</span>,
              <span className="tabular-nums">{formatMoney(r.accumulatedDepreciation)}</span>,
              <span className="tabular-nums font-semibold">{formatMoney(r.netBookValue)}</span>,
              <Badge tone={statusTone(r.status)} className="text-[10px] uppercase font-bold">
                {r.status}
              </Badge>,
            ])}
          />
        </ReportBlock>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ReportBlock
            title="Asset Valuation"
            subtitle="Current value breakdown by category"
            loading={valuation.isLoading}
            error={valuation.error}
          >
            <MiniTable
              columns={["Category", "Total Cost", "Total NBV"]}
              rows={(valuation.data || []).map((r) => [
                <span className="font-medium text-slate-700">{r.categoryName}</span>,
                <span className="tabular-nums">{formatMoney(r.totalCost)}</span>,
                <span className="tabular-nums font-semibold">{formatMoney(r.totalNBV)}</span>,
              ])}
            />
          </ReportBlock>

          <ReportBlock
            title={`Depreciation Summary`}
            subtitle={`Consolidated figures for ${period}`}
            loading={dep.isLoading}
            error={dep.error}
          >
            <MiniTable
              columns={["Category", "Depreciation Amount"]}
              rows={(dep.data || []).map((r) => [
                <span className="font-medium text-slate-700">{r.categoryName}</span>,
                <span className="tabular-nums font-semibold text-blue-600">{formatMoney(r.depreciationAmount)}</span>,
              ])}
            />
          </ReportBlock>
        </div>
      </div>
    </div>
  );
};

interface ReportBlockProps {
  title: string;
  subtitle?: string;
  loading?: boolean;
  error?: any;
  children: React.ReactNode;
}

const ReportBlock: React.FC<ReportBlockProps> = ({
  title,
  subtitle,
  loading,
  error,
  children,
}) => {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50/30 px-6 py-4">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-6">
        {loading && (
          <div className="flex items-center gap-2 py-4 text-sm text-slate-500">
            <div className="h-4 w-4 rounded-full border-2 border-slate-200 border-t-slate-600 animate-spin" />
            Generating preview...
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <p className="font-semibold">Failed to load report data</p>
            <p className="mt-1">{String(error?.message || error)}</p>
          </div>
        )}
        {!loading && !error && children}
      </div>
    </div>
  );
};

interface MiniTableProps {
  columns: string[];
  rows: React.ReactNode[][];
}

const MiniTable: React.FC<MiniTableProps> = ({ columns, rows }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50/80 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          <tr>
            {columns.map((c) => (
              <th key={c} className="px-4 py-3 border-b border-slate-100">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.length > 0 ? (
            rows.map((r, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                {r.map((cell, j) => (
                  <td key={j} className="px-4 py-3 text-slate-600">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-slate-400 italic"
              >
                No report data available for the selected parameters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AssetReportsPage;
