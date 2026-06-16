import { useState } from "react";
import { useCreateUnit } from "../../api/financeHooks";
import type { UnitType, CreateUnitPayload } from "../../api/types";
import ModalWrapper from "../../../components/modal-wrapper";

interface NewFinanceUnitProps {
    isOpen: boolean;
    onClose: () => void;
    modalMode: "add" | "edit";
    title?: string;
    onSave: (data: any) => void;

}

const unitTypes: UnitType[] = [
    "STORE",
    "SALARY",
    "LOAN_ADVANCE",
    "EXPENDITURE",
    "REVENUE",
    "OTHER",
];

export default function NewFinanceUnit({
    isOpen,
    onClose,
    modalMode,
    title = "",
    onSave,

}: NewFinanceUnitProps) {
    const createMut = useCreateUnit();

    const [form, setForm] = useState<Partial<CreateUnitPayload>>({
        code: "",
        name: "",
        unitType: undefined,
        currency: "NGN",
        status: "ACTIVE",
    });


    async function onCreate() {
        if (
            !form.code ||
            !form.name ||
            !form.currency ||
            !form.status
        )
            return;

        await createMut.mutateAsync(form);

        setForm({
            code: "",
            name: "",
            unitType: undefined,
            currency: "NGN",
            status: "ACTIVE",
        });
        onClose();
        onSave(form);
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
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-semibold text-slate-700">
                            Unit Code
                        </label>
                        <input
                            className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400"
                            placeholder="e.g., BURS"
                            value={form.code ?? ""}
                            onChange={(e) => setForm((s) => ({ ...s, code: e.target.value }))}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-semibold text-slate-700">
                            Unit Name
                        </label>
                        <input
                            className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400"
                            placeholder="Enter unit name"
                            value={form.name ?? ""}
                            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-semibold text-slate-700">
                            Currency
                        </label>
                        <input
                            className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400"
                            placeholder="e.g., NGN"
                            value={form.currency ?? "NGN"}
                            onChange={(e) =>
                                setForm((s: any) => ({ ...s, currency: e.target.value }))
                            }
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-semibold text-slate-700">
                            Unit Type
                        </label>
                        <select
                            className="appearance-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                            value={form.unitType ?? ""}
                            onChange={(e) =>
                                setForm((s) => ({
                                    ...s,
                                    unitType: e.target.value as UnitType,
                                }))
                            }
                        >
                            {["", ...unitTypes].map((t) => (
                                <option key={t} value={t}>
                                    {t.replace(/_/g, " ")}
                                </option>
                            ))}
                        </select>
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
                        disabled={createMut.isPending}
                        className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
                    >
                        {createMut.isPending ? (
                            <>
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                <span>Creating...</span>
                            </>
                        ) : (
                            <span>Create Unit</span>
                        )}
                    </button>
                </div>
            </div>
        </ModalWrapper>
    );
}
