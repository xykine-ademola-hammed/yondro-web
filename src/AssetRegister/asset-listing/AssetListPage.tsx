import React, { useMemo, useState } from "react";
import { useAssetCategories, useAssets } from "../Components/assetHooks";
import { Badge, Button, Input, Select } from "../Components/primitive";
import { formatMoney, statusTone, downloadFile } from "../Components/utils";
import type { AssetStatus, UUID } from "../Components/types";
import { useNavigate, useSearchParams } from "react-router-dom";
import CreateAssetModal from "./CreateAssetModal";

const API_BASE = import.meta.env.VITE_API_URL + "api";

interface AssetListPageProps {
  unitType: string;
}

const AssetListPage: React.FC<AssetListPageProps> = ({ unitType }) => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [createOpen, setCreateOpen] = useState(false);

  const search = params.get("search") || "";
  const status = (params.get("status") || "") as AssetStatus | "";
  const categoryId = (params.get("categoryId") || "") as UUID | "";
  const location = params.get("location") || "";

  const { data, isLoading, error } = useAssets({
    unitType,
    search,
    status,
    categoryId,
    location,
  });

  const { data: categories } = useAssetCategories(unitType);

  const totals = useMemo(() => {
    const rows = data?.rows || [];
    return {
      cost: rows.reduce((s, r) => s + Number(r.cost || 0), 0),
      ad: rows.reduce((s, r) => s + Number(r.accumulatedDepreciation || 0), 0),
      nbv: rows.reduce((s, r) => s + Number(r.netBookValue || 0), 0),
    };
  }, [data]);

  const updateQS = (next: Record<string, string>) => {
    const p = new URLSearchParams(params);
    Object.entries(next).forEach(([k, v]) => {
      const val = (v ?? "").toString();
      if (!val) p.delete(k);
      else p.set(k, val);
    });
    setParams(p);
  };

  const clearFilters = () => {
    const p = new URLSearchParams(params);
    ["search", "status", "categoryId", "location"].forEach((k) => p.delete(k));
    setParams(p);
  };

  const handleExport = (type: "xlsx" | "pdf") => {
    const filename = `asset-list-${unitType}.${type}`;
    const exportParams = new URLSearchParams({
      unitType,
      search: params.get("search") || "",
      status: params.get("status") || "",
      categoryId: params.get("categoryId") || "",
      location: params.get("location") || "",
    });
    downloadFile(
      `${API_BASE}/assets/export.${type}?${exportParams.toString()}`,
      filename,
      true,
    );
  };

  const rows = data?.rows || [];

  const TotalsChips = (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="rounded-full border bg-slate-50 px-2.5 py-1 text-slate-600">
        Total Cost:{" "}
        <span className="font-semibold text-slate-900">
          {formatMoney(totals.cost)}
        </span>
      </span>
      <span className="rounded-full border bg-slate-50 px-2.5 py-1 text-slate-600">
        Acc Dep:{" "}
        <span className="font-semibold text-slate-900">
          {formatMoney(totals.ad)}
        </span>
      </span>
      <span className="rounded-full border bg-slate-50 px-2.5 py-1 text-slate-600">
        NBV:{" "}
        <span className="font-semibold text-slate-900">
          {formatMoney(totals.nbv)}
        </span>
      </span>
      <span className="rounded-full border bg-white px-2.5 py-1 text-slate-500">
        {rows.length} result{rows.length === 1 ? "" : "s"}
      </span>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 px-3 pb-24 pt-4 sm:px-6 sm:pb-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-slate-900 sm:text-2xl">
            Assets
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Search, filter, export, and manage assets.
          </p>
          {/* <div className="mt-3">{TotalsChips}</div> */}
        </div>

        {/* Desktop actions */}
        <div className="hidden sm:flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={() => handleExport("xlsx")}>
            Export Excel
          </Button>
          <Button variant="secondary" onClick={() => handleExport("pdf")}>
            Export PDF
          </Button>
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            New Asset
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-5">
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Search
            </label>
            <Input
              value={search}
              onChange={(e) => updateQS({ search: e.target.value })}
              placeholder="Search by tag, name, category…"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Status
            </label>
            <Select
              value={status}
              onChange={(e) => updateQS({ status: e.target.value })}
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="CAPITALIZED">Capitalized</option>
              <option value="IN_SERVICE">In Service</option>
              <option value="IMPAIRED">Impaired</option>
              <option value="DISPOSED">Disposed</option>
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Category
            </label>
            <Select
              value={categoryId}
              onChange={(e) => updateQS({ categoryId: e.target.value })}
            >
              <option value="">All Categories</option>
              {categories?.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Location
            </label>
            <Input
              value={location}
              onChange={(e) => updateQS({ location: e.target.value })}
              placeholder="e.g. Main store, HQ…"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="hidden sm:block">{TotalsChips}</div>

          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <button
              onClick={clearFilters}
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Clear filters
            </button>
          </div>
        </div>
      </div>

      {/* Results container */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-600" />
              <span className="text-sm font-medium text-slate-600">
                Loading assets...
              </span>
            </div>
          </div>
        )}

        {/* Mobile cards */}
        <div className="md:hidden">
          {rows.length > 0 ? (
            <div className="space-y-3 p-3">
              {rows.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition active:scale-[0.99]"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/asset-register/asset/${r.id}`)}
                >
                  {/* Top row: tag/name + status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold text-slate-900">
                              {r.assetTag}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="truncate text-sm text-slate-700">
                              {r.name}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* meta */}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="max-w-[70%] truncate rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {r.category?.name || "—"}
                        </span>
                        <span className="max-w-[70%] truncate text-xs text-slate-500">
                          {r.location ? r.location : "No location"}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <Badge tone={statusTone(r.status)}>{r.status}</Badge>
                    </div>
                  </div>

                  {/* Stats: 2 cols + NBV full width */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Cost
                      </div>
                      <div className="mt-1 text-[13px] font-semibold leading-tight tabular-nums text-slate-900 break-words">
                        {formatMoney(r.cost)}
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Acc Dep
                      </div>
                      <div className="mt-1 text-[13px] font-semibold leading-tight tabular-nums text-slate-900 break-words">
                        {formatMoney(r.accumulatedDepreciation)}
                      </div>
                    </div>

                    <div className="col-span-2 rounded-xl bg-white p-3 ring-1 ring-slate-200">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        NBV
                      </div>
                      <div className="mt-1 text-sm font-semibold leading-tight tabular-nums text-slate-900 break-words">
                        {formatMoney(r.netBookValue)}
                      </div>
                    </div>
                  </div>

                  {/* Action row */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <button
                      className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/asset-register/${r.id}?unitType=${unitType}`);
                      }}
                    >
                      Open details →
                    </button>

                    <span className="text-xs text-slate-400">
                      Tap card to view
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !isLoading && (
              <div className="p-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                  <div className="text-3xl">📭</div>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    No assets found
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Try adjusting your filters or create a new asset.
                  </p>

                  <div className="mt-4">
                    <button
                      onClick={() => setCreateOpen(true)}
                      className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-black"
                    >
                      New Asset
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-5 py-4">Asset Tag</th>
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4 text-right">Cost</th>
                  <th className="px-5 py-4 text-right">Acc Dep</th>
                  <th className="px-5 py-4 text-right">NBV</th>
                  <th className="px-5 py-4 text-center">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {rows.length > 0
                  ? rows.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => navigate(`/asset-register/asset/${r.id}`)}
                      className="cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <button
                          className="font-semibold text-slate-900 hover:text-blue-600 hover:underline transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/asset-register/${r.id}?unitType=${unitType}`);
                          }}
                        >
                          {r.assetTag}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-slate-700">{r.name}</td>
                      <td className="px-5 py-4 text-slate-600">
                        {r.category?.name}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {r.location || (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums text-slate-900">
                        {formatMoney(r.cost)}
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums text-slate-700">
                        {formatMoney(r.accumulatedDepreciation)}
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums font-medium text-slate-900">
                        {formatMoney(r.netBookValue)}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <Badge tone={statusTone(r.status)}>{r.status}</Badge>
                      </td>
                    </tr>
                  ))
                  : !isLoading && (
                    <tr>
                      <td
                        className="px-5 py-12 text-center text-sm text-slate-500"
                        colSpan={8}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-3xl">📭</span>
                          <p>No assets found matching your criteria.</p>
                        </div>
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CreateAssetModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        unitType={unitType}
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <p className="font-semibold">Error loading assets</p>
          <p className="mt-1">{String((error as any)?.message || error)}</p>
        </div>
      )}

      {/* Mobile sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-3">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-800">Assets</div>
            <div className="truncate text-xs text-slate-500">
              {rows.length} result{rows.length === 1 ? "" : "s"} •{" "}
              {formatMoney(totals.nbv)} NBV
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => handleExport("xlsx")}
              className="rounded-xl border px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Excel
            </button>
            <button
              onClick={() => handleExport("pdf")}
              className="rounded-xl border px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              PDF
            </button>
            <button
              onClick={() => setCreateOpen(true)}
              className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-black"
            >
              New
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetListPage;
