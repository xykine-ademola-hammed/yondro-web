import React, { useEffect, useState } from "react";
import { useCreateAssetCategory, useUpdateAssetCategory } from "../Components/assetHooks";
import { Button, Input, Select } from "../Components/primitive";
import type { AssetCategory, DepMethod, ResidualPolicy } from "../Components/types";
import AccountTypeahead from "../../FinanceReporting/components/AccountTypeahead";

interface CreateAssetCategoryModalProps {
    open: boolean;
    onClose: () => void;
    unitType: string;
    category?: AssetCategory | null;
}

const CreateAssetCategoryModal: React.FC<CreateAssetCategoryModalProps> = ({
    open,
    onClose,
    unitType,
    category,
}) => {
    const isEdit = !!category;
    const createMutation = useCreateAssetCategory(unitType);
    const updateMutation = useUpdateAssetCategory(unitType);

    const [formData, setFormData] = useState({
        code: "",
        name: "",
        assetAccountId: "",
        accumDepAccountId: "",
        depExpAccountId: "",
        depMethod: "SL" as DepMethod,
        usefulLifeMonths: "" as number | "",
        depRateAnnual: "" as number | "",
        isDepreciable: true,
        residualValuePolicy: "NONE" as ResidualPolicy,
        residualValueAmount: "" as number | "",
        residualValuePercent: "" as number | "",
        status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    });

    useEffect(() => {
        if (category) {
            setFormData({
                code: category.code,
                name: category.name,
                assetAccountId: category.assetAccountId,
                accumDepAccountId: category.accumDepAccountId,
                depExpAccountId: category.depExpAccountId,
                depMethod: category.depMethod,
                usefulLifeMonths: category.usefulLifeMonths || "",
                depRateAnnual: category.depRateAnnual || "",
                isDepreciable: category.isDepreciable,
                residualValuePolicy: category.residualValuePolicy,
                residualValueAmount: category.residualValueAmount || "",
                residualValuePercent: category.residualValuePercent || "",
                status: category.status,
            });
        } else {
            setFormData({
                code: "",
                name: "",
                assetAccountId: "",
                accumDepAccountId: "",
                depExpAccountId: "",
                depMethod: "SL",
                usefulLifeMonths: "",
                depRateAnnual: "",
                isDepreciable: true,
                residualValuePolicy: "NONE",
                residualValueAmount: "",
                residualValuePercent: "",
                status: "ACTIVE",
            });
        }
    }, [category, open]);

    if (!open) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            unitType,
            usefulLifeMonths: formData.usefulLifeMonths || null,
            depRateAnnual: formData.depRateAnnual || null,
            residualValueAmount: formData.residualValueAmount || null,
            residualValuePercent: formData.residualValuePercent || null,
        };

        try {
            if (isEdit && category) {
                await updateMutation.mutateAsync({ id: category.id, payload });
            } else {
                await createMutation.mutateAsync(payload);
            }
            onClose();
        } catch (err) {
            console.error("Failed to save category", err);
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-600/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
                <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 px-6 py-4 backdrop-blur-md">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900">
                            {isEdit ? "Edit Asset Category" : "New Asset Category"}
                        </h2>
                        <button
                            onClick={onClose}
                            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Basic Info</h3>

                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Code</label>
                                <Input
                                    required
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    placeholder="e.g. FURN"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Name</label>
                                <Input
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Furniture & Fittings"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Status</label>
                                <Select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">GL Accounts</h3>

                            <div>
                                <AccountTypeahead
                                    required
                                    label="Asset Account"
                                    accountType='ASSET'
                                    value={formData.assetAccountId}
                                    onChange={(id) => setFormData({ ...formData, assetAccountId: id || "" })}
                                />
                            </div>

                            <div>
                                <AccountTypeahead
                                    required
                                    label="Accum. Dep. Account"
                                    accountType='ASSET'
                                    value={formData.accumDepAccountId}
                                    onChange={(id) => setFormData({ ...formData, accumDepAccountId: id || "" })}
                                />
                            </div>

                            <div>
                                <AccountTypeahead
                                    required
                                    label="Dep. Expense Account"
                                    accountType='ASSET'
                                    value={formData.depExpAccountId}
                                    onChange={(id) => setFormData({ ...formData, depExpAccountId: id || "" })}
                                />
                            </div>
                        </div>

                        <div className="space-y-4 md:col-span-2 border-t border-slate-100 pt-6">
                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Depreciation Settings</h3>

                            <div className="flex items-center gap-2 mb-4">
                                <input
                                    type="checkbox"
                                    id="isDepreciable"
                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    checked={formData.isDepreciable}
                                    onChange={(e) => setFormData({ ...formData, isDepreciable: e.target.checked })}
                                />
                                <label htmlFor="isDepreciable" className="text-sm font-medium text-slate-700">
                                    This category is depreciable
                                </label>
                            </div>

                            {formData.isDepreciable && (
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">Depreciation Method</label>
                                        <Select
                                            value={formData.depMethod}
                                            onChange={(e) => setFormData({ ...formData, depMethod: e.target.value as DepMethod })}
                                        >
                                            <option value="SL">Straight Line (SL)</option>
                                            <option value="RB">Reducing Balance (RB)</option>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">Useful Life (Months)</label>
                                        <Input
                                            type="number"
                                            value={formData.usefulLifeMonths}
                                            onChange={(e) => setFormData({ ...formData, usefulLifeMonths: e.target.value ? Number(e.target.value) : "" })}
                                            placeholder="e.g. 60"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">Annual Dep. Rate (%)</label>
                                        <Input
                                            type="number"
                                            step="0.000001"
                                            value={formData.depRateAnnual}
                                            onChange={(e) => setFormData({ ...formData, depRateAnnual: e.target.value ? Number(e.target.value) : "" })}
                                            placeholder="e.g. 20"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">Residual Value Policy</label>
                                        <Select
                                            value={formData.residualValuePolicy}
                                            onChange={(e) => setFormData({ ...formData, residualValuePolicy: e.target.value as ResidualPolicy })}
                                        >
                                            <option value="NONE">None</option>
                                            <option value="FIXED">Fixed Amount</option>
                                            <option value="PERCENT">Percentage of Cost</option>
                                        </Select>
                                    </div>

                                    {formData.residualValuePolicy === "FIXED" && (
                                        <div>
                                            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Residual Amount</label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={formData.residualValueAmount}
                                                onChange={(e) => setFormData({ ...formData, residualValueAmount: e.target.value ? Number(e.target.value) : "" })}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    )}

                                    {formData.residualValuePolicy === "PERCENT" && (
                                        <div>
                                            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Residual Percentage (%)</label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={formData.residualValuePercent}
                                                onChange={(e) => setFormData({ ...formData, residualValuePercent: e.target.value ? Number(e.target.value) : "" })}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
                        <Button variant="secondary" type="button" onClick={onClose} disabled={isPending}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={isPending}>
                            {isPending ? "Saving..." : isEdit ? "Update Category" : "Create Category"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateAssetCategoryModal;
