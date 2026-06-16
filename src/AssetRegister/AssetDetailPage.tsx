import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useAsset,
  useAssetTransactions,
  useAssetCategories,
  useUpdateAsset,
} from "./Components/assetHooks";
import { Badge, Button, Card, Modal, Input } from "./Components/primitive";
import { formatMoney, statusTone, downloadFile } from "./Components/utils";
import type { UUID } from "./Components/types";
import CapitalizeAssetModal from "./asset-listing/CapitalizeAssetModal";
import DisposeAssetModal from "./asset-listing/DisposeAssetModal";

const API_BASE = import.meta.env.VITE_API_URL + "api";

interface AssetDetailPageProps {
  unitType: string;
}

const AssetDetailPage: React.FC<AssetDetailPageProps> = ({ unitType }) => {
  const { assetId = "" } = useParams<{ assetId: UUID }>();
  const navigate = useNavigate();

  const assetQuery = useAsset(assetId as UUID);
  const asset = assetQuery.data?.data;
  const { isLoading, error } = assetQuery;

  console.log("asset======", asset);

  const { data: tx } = useAssetTransactions(assetId as UUID);
  const { data: categories } = useAssetCategories(unitType);

  console.log("tx======", tx);

  const update = useUpdateAsset(unitType);

  const [tab, setTab] = useState<"overview" | "financial" | "history">("overview");
  const [capOpen, setCapOpen] = useState(false);
  const [dispOpen, setDispOpen] = useState(false);

  const nbv = (asset?.cost || 0) - (asset?.accumulatedDepreciation || 0);

  const handleDownloadVoucher = () => {
    const filename = `asset-${asset?.assetTag || assetId}-voucher.pdf`;
    downloadFile(`${API_BASE}/assets/${assetId}/voucher.pdf`, filename);
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "financial", label: "Financial" },
    { id: "history", label: "History" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <span className="text-lg leading-none transition-transform group-hover:-translate-x-0.5">←</span>
            Back to list
          </button>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">
              {asset?.assetTag || "Asset Detail"}
            </h1>
            {asset?.status && (
              <Badge tone={statusTone(asset.status)} className="uppercase tracking-wider">
                {asset.status}
              </Badge>
            )}
          </div>
          {asset?.name && <p className="text-sm text-slate-500 font-medium">{asset.name}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={handleDownloadVoucher}>
            Voucher PDF
          </Button>

          <Button
            variant="primary"
            onClick={() => setCapOpen(true)}
            disabled={!asset || asset.status !== "DRAFT"}
            title={
              !asset || asset.status !== "DRAFT"
                ? "Only DRAFT assets can be capitalized"
                : ""
            }
          >
            Capitalize
          </Button>

          <Button
            variant="danger"
            onClick={() => setDispOpen(true)}
            disabled={
              !asset ||
              !["IN_SERVICE", "CAPITALIZED", "IMPAIRED"].includes(asset.status)
            }
          >
            Dispose
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <div className="h-4 w-4 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin" />
          Loading asset details…
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <p className="font-semibold">Error loading asset</p>
          <p className="mt-1">{String((error as any)?.message || error)}</p>
        </div>
      )}

      {asset && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card title="Cost" value={formatMoney(asset.cost)} />
            <Card
              title="Accum Dep"
              value={formatMoney(asset.accumulatedDepreciation)}
            />
            <Card title="NBV" value={formatMoney(nbv)} className="bg-blue-50/30" />
            <Card title="In Service Date" value={asset.inServiceDate || "—"} />
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-1 border-b border-slate-200 bg-slate-50/50 px-4 py-2">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${tab === t.id
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:bg-white hover:text-slate-700"
                    }`}
                  onClick={() => setTab(t.id as any)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {tab === "overview" && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <DetailField label="Asset Tag" value={asset.assetTag} />
                  <DetailField label="Name" value={asset.name} />
                  <DetailField
                    label="Category"
                    value={
                      categories?.data?.find((c) => c.id === asset.categoryId)?.name ||
                      asset.categoryId
                    }
                  />
                  <DetailField label="Location" value={asset.location || "—"} />
                  <DetailField
                    label="Custodian"
                    value={asset.custodianEmployeeId || "—"}
                  />
                  <DetailField
                    label="Description"
                    value={asset.description || "—"}
                    full
                  />
                  <div className="mt-4 md:col-span-2">
                    <InlineEdit
                      title="operational details"
                      onSave={(patch) => update.mutate({ id: assetId as UUID, payload: patch })}
                      saving={update.isPending}
                      fields={[
                        { key: "name", label: "Name", defaultValue: asset.name },
                        {
                          key: "location",
                          label: "Location",
                          defaultValue: asset.location || "",
                        },
                        {
                          key: "description",
                          label: "Description",
                          defaultValue: asset.description || "",
                        },
                      ]}
                    />
                  </div>
                </div>
              )}

              {tab === "financial" && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <DetailField
                    label="Acquisition Date"
                    value={asset.acquisitionDate || "—"}
                  />
                  <DetailField
                    label="Capitalization Date"
                    value={asset.capitalizationDate || "—"}
                  />
                  <DetailField
                    label="In Service Date"
                    value={asset.inServiceDate || "—"}
                  />
                  <DetailField
                    label="Residual Value"
                    value={formatMoney(asset.residualValue)}
                  />
                  <DetailField
                    label="Dep Method"
                    value={asset.depMethod === "SL" ? "Straight Line (SL)" : asset.depMethod === "RB" ? "Reducing Balance (RB)" : "From Category"}
                  />
                  <DetailField
                    label="Useful Life"
                    value={
                      asset.usefulLifeMonths
                        ? `${asset.usefulLifeMonths} months`
                        : "From Category"
                    }
                  />
                  <DetailField
                    label="Dep Rate Annual"
                    value={
                      asset.depRateAnnual
                        ? `${asset.depRateAnnual}%`
                        : "From Category"
                    }
                  />
                  <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-sm text-blue-800 md:col-span-2">
                    <div className="flex items-center gap-2 font-semibold">
                      <span className="text-lg">ℹ️</span>
                      Accounting Policy
                    </div>
                    <p className="mt-1 text-blue-700 leading-relaxed">
                      Financial parameters (cost, depreciation method, etc.) are locked after capitalization.
                      Any changes must be processed through an authorized adjustment workflow.
                    </p>
                  </div>
                </div>
              )}

              {tab === "history" && (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Period</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                        <th className="px-4 py-3 text-center">Journal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {Array.isArray(tx) || Array.isArray((tx as any)?.data) ? (
                        ((Array.isArray(tx) ? tx : (tx as any)?.data) as any[]).map((r) => (
                          <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 text-slate-700 font-medium">{r.txnDate}</td>
                            <td className="px-4 py-3">
                              <Badge tone="blue" className="text-[10px] font-bold">
                                {r.txnType}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{r.period}</td>
                            <td className="px-4 py-3 text-right tabular-nums text-slate-900 font-medium">
                              {formatMoney(r.amount)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {r.journalHeaderId ? (
                                <button
                                  className="text-blue-600 hover:underline font-medium transition-colors"
                                  onClick={() =>
                                    downloadFile(
                                      `${API_BASE}/finance/journals/${r.journalHeaderId}/voucher.pdf`,
                                      `journal-${r.journalHeaderId}.pdf`
                                    )
                                  }
                                >
                                  View Voucher
                                </button>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-12 text-center text-slate-500"
                          >
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-2xl">📜</span>
                              <p>No transaction history found for this asset.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <CapitalizeAssetModal
            open={capOpen}
            onClose={() => setCapOpen(false)}
            unitId={unitType}
            asset={asset}
          />
          <DisposeAssetModal
            open={dispOpen}
            onClose={() => setDispOpen(false)}
            unitId={unitType}
            asset={asset}
          />
        </div>
      )}
    </div>
  );
};

const DetailField: React.FC<{ label: string; value: React.ReactNode; full?: boolean }> = ({
  label,
  value,
  full,
}) => {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-sm ${full ? "md:col-span-2" : ""
        }`}
    >
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</div>
      <div className="mt-1.5 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
};

interface InlineEditProps {
  title: string;
  fields: Array<{ key: string; label: string; defaultValue: string }>;
  onSave: (patch: any) => void;
  saving: boolean;
}

const InlineEdit: React.FC<InlineEditProps> = ({ title, fields, onSave, saving }) => {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((f) => [f.key, f.defaultValue]))
  );

  return (
    <div className="md:col-span-2">
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-4">
        <div>
          <div className="text-sm font-bold text-slate-900 uppercase tracking-tight">Update {title}</div>
          <p className="mt-0.5 text-xs text-slate-500">
            Edit non-accounting parameters of this asset.
          </p>
        </div>
        <Button variant="secondary" onClick={() => setOpen(true)} className="bg-white">
          Edit Fields
        </Button>
      </div>

      <Modal
        open={open}
        title={`Update ${title}`}
        onClose={() => setOpen(false)}
        maxWidth="lg"
        footer={
          <div className="flex w-full items-center justify-between">
            <div className="text-xs text-slate-500">
              * Accounting fields cannot be changed here.
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setOpen(false)} variant="secondary">
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const patch: any = {};
                  fields.forEach((f) => {
                    patch[f.key] = state[f.key];
                  });
                  onSave(patch);
                  setOpen(false);
                }}
                variant="primary"
                disabled={saving}
              >
                {saving ? "Saving Changes…" : "Save Changes"}
              </Button>
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {fields.map((f) => (
            <div
              key={f.key}
              className={f.key === "description" ? "md:col-span-2" : ""}
            >
              <label className="mb-1.5 block text-xs font-bold text-slate-600 uppercase tracking-wider">
                {f.label}
              </label>
              <Input
                value={state[f.key] || ""}
                onChange={(e) =>
                  setState((s) => ({ ...s, [f.key]: e.target.value }))
                }
                placeholder={`Enter ${f.label.toLowerCase()}...`}
              />
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default AssetDetailPage;
