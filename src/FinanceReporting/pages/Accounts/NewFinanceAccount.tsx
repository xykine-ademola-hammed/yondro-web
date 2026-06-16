import { useState } from "react";
import { useCreateAccount, useUnits } from "../../api/financeHooks";
import type { AccountType, GLAccount, NormalBalance } from "../../api/types";
import NcoaLookup from "../../../Finance Doc/votebook/NcoaLookup";
import type { NcoaCode } from "../../../Finance Doc/votebook/VoteBookAccountForm";
import ModalWrapper from "../../../components/modal-wrapper";

interface NewFinanceAccountProps {
    isOpen: boolean;
    onClose: () => void;
    modalMode: "add" | "edit";
    title?: string;
    onSave: (data: any) => void;

}

const accountTypes: AccountType[] = [
    "ASSET",
    "LIABILITY",
    "EQUITY",
    "INCOME",
    "EXPENSE",
];
const normalBalances: NormalBalance[] = ["DEBIT", "CREDIT"];

export default function NewFinanceAccount({
    isOpen,
    onClose,
    modalMode,
    title = "",
    onSave,

}: NewFinanceAccountProps) {
    const { data: units } = useUnits();
    const [unitId, setUnitId] = useState<string>("");

    const createMut = useCreateAccount(unitId as any);

    const [form, setForm] = useState<Partial<GLAccount>>({
        accountCode: "",
        accountName: "",
        accountType: "ASSET",
        normalBalance: "DEBIT",
        isCash: false,
        status: "ACTIVE",
    });

    const [selectedNcoaCode, setSelectedNcoaCode] = useState<NcoaCode | null>(
        null
    );

    const handleNcoaSelect = (code: NcoaCode) => {
        setSelectedNcoaCode(code);
        setForm((s) => ({ ...s, accountCode: code.code }));
    };

    async function onCreate() {
        if (!unitId) return;
        if (
            !form.accountCode ||
            !form.accountName ||
            !form.accountType ||
            !form.normalBalance
        )
            return;

        await createMut.mutateAsync({ ...form, unitId: unitId });

        setForm({
            accountCode: "",
            accountName: "",
            accountType: "ASSET",
            normalBalance: "DEBIT",
            isCash: false,
            status: "ACTIVE",
        });
        setSelectedNcoaCode(null);
        onClose();
        onSave(form);
    }

    return (
        <ModalWrapper
            isOpen={isOpen}
            onClose={onClose}
            title={
                title || (modalMode === "add" ? "Add New Finance Account" : "Edit Employee")
            }
        >
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="text-xs font-semibold  text-gray-600">Unit</label>
                        <select
                            className="w-full rounded-lg border px-3 py-2 text-sm"
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

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-600">Account Code (NCOA)</label>
                        <NcoaLookup
                            onSelect={handleNcoaSelect}
                            selectedCode={selectedNcoaCode}
                            showLabel={false}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-600">Account Name</label>
                        <input
                            className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Office Equipment"
                            value={form.accountName ?? ""}
                            onChange={(e) =>
                                setForm((s) => ({ ...s, accountName: e.target.value }))
                            }
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-600">Account Type</label>
                        <select
                            className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={form.accountType ?? "ASSET"}
                            onChange={(e) =>
                                setForm((s) => ({
                                    ...s,
                                    accountType: e.target.value as AccountType,
                                }))
                            }
                        >
                            {accountTypes.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-600">Normal Balance</label>
                        <select
                            className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={form.normalBalance ?? "DEBIT"}
                            onChange={(e) =>
                                setForm((s) => ({
                                    ...s,
                                    normalBalance: e.target.value as NormalBalance,
                                }))
                            }
                        >
                            {normalBalances.map((b) => (
                                <option key={b} value={b}>
                                    {b}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="isCash"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={!!form.isCash}
                            onChange={(e) =>
                                setForm((s) => ({ ...s, isCash: e.target.checked }))
                            }
                        />
                        <label htmlFor="isCash" className="text-sm font-medium text-gray-700">
                            Cash or Bank Account
                        </label>
                    </div>
                </div>

                <div className="flex justify-end gap-3 border-t pt-4">
                    <button
                        onClick={onClose}
                        className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onCreate}
                        disabled={!unitId || createMut.isPending}
                        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-50 transition-colors"
                    >
                        {createMut.isPending ? "Adding Account..." : "Create Account"}
                    </button>
                </div>
            </div>
        </ModalWrapper>
    );
}
