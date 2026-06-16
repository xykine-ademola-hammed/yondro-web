import { useState } from "react";
import { useOpenPeriod, useUnits } from "../../api/financeHooks";
import ModalWrapper from "../../../components/modal-wrapper";

interface NewPeriodProps {
  isOpen: boolean;
  onClose: () => void;
  modalMode: "add" | "edit";
  title?: string;
  onSave: (data: any) => void;
}

const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

export default function NewPeriod({
  isOpen,
  onClose,
  modalMode,
  title = "",
  onSave,
}: NewPeriodProps) {
  const { data: units } = useUnits();
  const [unitId, setUnitId] = useState("");
  const [period, setPeriod] = useState(currentMonth); // get current month in YYYY-MM format
  const createPeriod = useOpenPeriod(unitId as any);

  async function onCreate() {
    await createPeriod.mutateAsync(period);
    setPeriod(currentMonth);
    onSave(period);
    onClose();
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={
        title || (modalMode === "add" ? "Add New Finance Unit" : "Edit Unit")
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
          <div>
            <label className="text-xs text-gray-600">Unit</label>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
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
          </div>

          <div>
            <label className="text-xs text-gray-600">Period</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            onClick={onCreate}
            disabled={createPeriod.isPending}
            className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
          >
            {createPeriod.isPending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span>Creating...</span>
              </>
            ) : (
              <span>Create Period</span>
            )}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}
