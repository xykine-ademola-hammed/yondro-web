import React, { useState } from "react";
import { useDisposeAsset } from "../Components/assetHooks";
import type { Asset, UUID } from "../Components/types";
import { Button, Input, Modal } from "../Components/primitive";
import { formatMoney } from "../Components/utils";
import AccountTypeahead from "../../FinanceReporting/components/AccountTypeahead";

interface DisposeAssetModalProps {
  open: boolean;
  onClose: () => void;
  unitId: string;
  asset: Asset;
}

const DisposeAssetModal: React.FC<DisposeAssetModalProps> = ({
  open,
  onClose,
  unitId,
  asset,
}) => {
  const disp = useDisposeAsset(unitId as UUID);

  const [period, setPeriod] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  });

  const [transactionDate, setTransactionDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });

  const [proceeds, setProceeds] = useState("0");
  const [cashAccountId, setCashAccountId] = useState<string | null>(null);
  const [gainAccountId, setGainAccountId] = useState<string | null>(null);
  const [lossAccountId, setLossAccountId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const nbv = (asset.cost || 0) - (asset.accumulatedDepreciation || 0);

  const handleSubmit = () => {
    disp.mutate(
      {
        assetId: asset.id as UUID,
        payload: {
          period,
          transactionDate,
          proceeds: Number(proceeds || 0),
          cashAccountId,
          gainAccountId,
          lossAccountId,
          notes: notes || undefined,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Modal
      open={open}
      title={`Dispose Asset — ${asset.assetTag}`}
      onClose={onClose}
      maxWidth="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={disp.isPending || !cashAccountId || !gainAccountId || !lossAccountId}
            onClick={handleSubmit}
          >
            {disp.isPending ? "Processing..." : "Confirm Disposal"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 font-medium font-bold uppercase text-[10px] tracking-wider">Current Net Book Value</span>
            <span className="text-slate-900 font-bold text-base">{formatMoney(nbv)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Cost: {formatMoney(asset.cost)}</span>
            <span>Acc. Dep: {formatMoney(asset.accumulatedDepreciation)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600 uppercase tracking-wider">
              Disposal Period
            </label>
            <Input
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="YYYY-MM"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600 uppercase tracking-wider">
              Disposal Date
            </label>
            <Input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600 uppercase tracking-wider">
              Disposal Proceeds
            </label>
            <Input
              type="number"
              value={proceeds}
              onChange={(e) => setProceeds(e.target.value)}
            />
          </div>
          <div>
            <AccountTypeahead
              required
              label="Cash / Bank Account"
              accountType='ASSET'
              value={cashAccountId}
              onChange={(id) => setCashAccountId(id)}
            />
          </div>
          <div>
            <AccountTypeahead
              required
              label="Gain on Disposal Account"
              accountType='ASSET'
              value={gainAccountId}
              onChange={(id) => setGainAccountId(id)}
            />
          </div>
          <div>
            <AccountTypeahead
              required
              label="Loss on Disposal Account"
              accountType='ASSET'
              value={lossAccountId}
              onChange={(id) => setLossAccountId(id)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-bold text-slate-600 uppercase tracking-wider">
              Disposal Notes / Reasoning
            </label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes for audit trail"
            />
          </div>

          {disp.isError && (
            <div className="md:col-span-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <p className="font-semibold text-rose-800">Disposal failed</p>
              <p className="mt-1">{String((disp.error as any)?.message || disp.error)}</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default DisposeAssetModal;
