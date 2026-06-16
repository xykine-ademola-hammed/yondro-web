import React, { useState } from "react";
import { Button, Input, Modal, Select } from "../Components/primitive";
import type { Asset, UUID } from "../Components/types";
import { useCapitalizeAsset } from "../Components/assetHooks";
import { useAllAccounts } from "../../FinanceReporting/api/financeHooks";

interface CapitalizeAssetModalProps {
  open: boolean;
  onClose: () => void;
  unitId: string;
  asset: Asset;
}

const CapitalizeAssetModal: React.FC<CapitalizeAssetModalProps> = ({
  open,
  onClose,
  asset,
}) => {
  const cap = useCapitalizeAsset(asset.id as UUID);
  const { data: accounts } = useAllAccounts('ASSET');

  const glAccounts = accounts?.data || [];

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

  const [amount, setAmount] = useState(String(asset.cost || 0));
  const [creditAccountId, setCreditAccountId] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [description, setDescription] = useState(
    `Capitalization for ${asset.assetTag}`
  );

  const handleSubmit = () => {
    cap.mutate(
      {
        period,
        transactionDate,
        amount: Number(amount || 0),
        creditAccountId,
        referenceNo: referenceNo || undefined,
        description: description || undefined,
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
      title={`Capitalize Asset — ${asset.assetTag}`}
      onClose={onClose}
      maxWidth="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={cap.isPending || !creditAccountId || !amount}
            onClick={handleSubmit}
          >
            {cap.isPending ? "Posting…" : "Confirm Capitalization"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-600 uppercase tracking-wider">
            Accounting Period
          </label>
          <Input
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            placeholder="YYYY-MM"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-600 uppercase tracking-wider">
            Transaction Date
          </label>
          <Input
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-600 uppercase tracking-wider">
            Capitalization Amount
          </label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div>
          {/* <label className="mb-1.5 block text-xs font-bold text-slate-600 uppercase tracking-wider">
            Credit Account (Clearing)
          </label>
          <Input
            value={creditAccountId}
            onChange={(e) => setCreditAccountId(e.target.value)}
            placeholder="GL Account Code"
          /> */}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Accum. Dep. Account</label>
            <Select
              required
              value={creditAccountId}
              onChange={(e) => setCreditAccountId(e.target.value)}
            >
              <option value="">Select Account</option>
              {glAccounts.map((a: any) => (
                <option key={a.id} value={a.id}>{a.accountCode} - {a.accountName}</option>
              ))}
            </Select>
          </div>


        </div>
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-xs font-bold text-slate-600 uppercase tracking-wider">
            Reference No
          </label>
          <Input
            value={referenceNo}
            onChange={(e) => setReferenceNo(e.target.value)}
            placeholder="e.g. INV-2024-001"
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-xs font-bold text-slate-600 uppercase tracking-wider">
            Description / Narration
          </label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description of the entry"
          />
        </div>

        {cap.isError && (
          <div className="md:col-span-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <p className="font-semibold text-rose-800">Post failed</p>
            <p className="mt-1">{String((cap.error as any)?.message || cap.error)}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CapitalizeAssetModal;
