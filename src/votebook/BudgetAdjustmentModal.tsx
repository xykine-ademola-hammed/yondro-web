import React, { useState, useEffect } from "react";
import { voteBookAPI, budgetAdjustmentAPI } from "../services/api";
import {
  Plus,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  X,
} from "lucide-react";
import type { VoteBookAccount } from "./VoteBookManagement";

interface BudgetAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedAccount?: VoteBookAccount | null;
}

const BudgetAdjustmentModal: React.FC<BudgetAdjustmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  selectedAccount,
}) => {
  const [accounts, setAccounts] = useState<VoteBookAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    adjustment_type: "SUPPLEMENT",
    from_account_id: "",
    to_account_id: selectedAccount?.id?.toString() || "",
    amount: "",
    justification: "",
    effective_date: new Date().toISOString().split("T")[0],
    attachment_count: 0,
  });
  const [errors, setErrors] = useState<any>({});
  const [simulation, setSimulation] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      loadAccounts();
      if (selectedAccount) {
        setFormData((prev) => ({
          ...prev,
          to_account_id: selectedAccount.id.toString(),
        }));
      }
    }
  }, [isOpen, selectedAccount]);

  const loadAccounts = async () => {
    try {
      const response = await voteBookAPI.getAccounts();
      setAccounts(response || []);
    } catch (error) {
      console.error("Failed to load accounts:", error);
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: null }));
    }
    setSimulation(null); // Clear simulation when form changes
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.adjustment_type)
      newErrors.adjustment_type = "Adjustment type is required";
    if (!formData.to_account_id)
      newErrors.to_account_id = "Destination account is required";
    if (!formData.amount || parseFloat(formData.amount) <= 0)
      newErrors.amount = "Valid amount is required";
    if (!formData.justification.trim())
      newErrors.justification = "Justification is required";
    if (!formData.effective_date)
      newErrors.effective_date = "Effective date is required";

    if (formData.adjustment_type === "TRANSFER" && !formData.from_account_id) {
      newErrors.from_account_id = "Source account is required for transfers";
    }

    if (
      formData.adjustment_type === "TRANSFER" &&
      formData.from_account_id === formData.to_account_id
    ) {
      newErrors.from_account_id =
        "Source and destination accounts must be different";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const adjustmentData = {
        ...formData,
        amount: parseFloat(formData.amount),
        from_account_id: formData.from_account_id
          ? parseInt(formData.from_account_id)
          : undefined,
        to_account_id: parseInt(formData.to_account_id),
      };

      await budgetAdjustmentAPI.createAdjustment(adjustmentData);

      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      setErrors({
        submit: error.message || "Failed to create budget adjustment",
      });
    } finally {
      setLoading(false);
    }
  };

  const simulateAdjustment = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Create a temporary adjustment to simulate
      const adjustmentData = {
        ...formData,
        amount: parseFloat(formData.amount),
        from_account_id: formData.from_account_id
          ? parseInt(formData.from_account_id)
          : undefined,
        to_account_id: parseInt(formData.to_account_id),
      };

      const tempAdjustment = await budgetAdjustmentAPI.createAdjustment(
        adjustmentData
      );
      const simulationResult = await budgetAdjustmentAPI.simulateAdjustment(
        tempAdjustment.id
      );

      setSimulation(simulationResult.simulation);
    } catch (error: any) {
      setErrors({ simulate: error.message || "Failed to simulate adjustment" });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      adjustment_type: "SUPPLEMENT",
      from_account_id: "",
      to_account_id: selectedAccount?.id?.toString() || "",
      amount: "",
      justification: "",
      effective_date: new Date().toISOString().split("T")[0],
      attachment_count: 0,
    });
    setErrors({});
    setSimulation(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            Budget Adjustment
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Adjustment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Adjustment Type *
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  value: "SUPPLEMENT",
                  label: "Top-Up",
                  description: "Add new funds to account",
                  icon: TrendingUp,
                },
                {
                  value: "REDUCTION",
                  label: "Reduction",
                  description: "Reduce account allocation",
                  icon: TrendingDown,
                },
                {
                  value: "TRANSFER",
                  label: "Transfer",
                  description: "Move funds between accounts",
                  icon: ArrowRightLeft,
                },
                {
                  value: "CARRYFORWARD",
                  label: "Carry Forward",
                  description: "Add prior year balance",
                  icon: Plus,
                },
                {
                  value: "REVERSAL",
                  label: "Reversal",
                  description: "Reverse commitment/spending",
                  icon: TrendingUp,
                },
              ].map((type) => {
                const Icon = type.icon;
                const isSelected = formData.adjustment_type === type.value;

                return (
                  <div
                    key={type.value}
                    className={`relative rounded-lg border p-4 cursor-pointer hover:bg-gray-50 ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300"
                    }`}
                    onClick={() =>
                      handleFormChange("adjustment_type", type.value)
                    }
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <Icon
                          className={`h-5 w-5 ${
                            isSelected ? "text-blue-600" : "text-gray-400"
                          }`}
                        />
                      </div>
                      <div className="ml-3">
                        <label className="block text-sm font-medium text-gray-900 cursor-pointer">
                          {type.label}
                        </label>
                        <p className="text-sm text-gray-500">
                          {type.description}
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="adjustment_type"
                      value={type.value}
                      checked={isSelected}
                      onChange={() =>
                        handleFormChange("adjustment_type", type.value)
                      }
                      className="absolute top-4 right-4"
                    />
                  </div>
                );
              })}
            </div>
            {errors.adjustment_type && (
              <p className="mt-1 text-sm text-red-600">
                {errors.adjustment_type}
              </p>
            )}
          </div>

          {/* Account Selection */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {formData.adjustment_type === "TRANSFER" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source Account *
                </label>
                <select
                  value={formData.from_account_id}
                  onChange={(e) =>
                    handleFormChange("from_account_id", e.target.value)
                  }
                  className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.from_account_id ? "border-red-300" : ""
                  }`}
                >
                  <option value="">Select source account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.code} - {account.name} (Available:{" "}
                      {formatCurrency(account.balances.available)})
                    </option>
                  ))}
                </select>
                {errors.from_account_id && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.from_account_id}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.adjustment_type === "TRANSFER"
                  ? "Destination Account *"
                  : "Account *"}
              </label>
              <select
                value={formData.to_account_id}
                onChange={(e) =>
                  handleFormChange("to_account_id", e.target.value)
                }
                className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.to_account_id ? "border-red-300" : ""
                }`}
              >
                <option value="">Select account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.code} - {account.name} (Available:{" "}
                    {formatCurrency(account.balances.available)})
                  </option>
                ))}
              </select>
              {errors.to_account_id && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.to_account_id}
                </p>
              )}
            </div>
          </div>

          {/* Amount and Date */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleFormChange("amount", e.target.value)}
                  className={`block w-full pl-7 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.amount ? "border-red-300" : ""
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effective Date *
              </label>
              <input
                type="date"
                value={formData.effective_date}
                onChange={(e) =>
                  handleFormChange("effective_date", e.target.value)
                }
                className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.effective_date ? "border-red-300" : ""
                }`}
              />
              {errors.effective_date && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.effective_date}
                </p>
              )}
            </div>
          </div>

          {/* Justification */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Justification *
            </label>
            <textarea
              rows={4}
              value={formData.justification}
              onChange={(e) =>
                handleFormChange("justification", e.target.value)
              }
              className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.justification ? "border-red-300" : ""
              }`}
              placeholder="Provide detailed justification for this budget adjustment..."
            />
            {errors.justification && (
              <p className="mt-1 text-sm text-red-600">
                {errors.justification}
              </p>
            )}
          </div>

          {/* Simulation Results */}
          {simulation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-3">
                Impact Simulation
              </h4>

              {simulation.fromAccount && (
                <div className="mb-3">
                  <div className="text-sm text-blue-800">
                    <strong>Source Account:</strong>{" "}
                    {simulation.fromAccount.code} -{" "}
                    {simulation.fromAccount.name}
                  </div>
                  <div className="text-sm text-blue-700">
                    Current Available:{" "}
                    {formatCurrency(simulation.fromAccount.current_available)} →
                    After:{" "}
                    {formatCurrency(simulation.fromAccount.after_available)}
                  </div>
                </div>
              )}

              <div>
                <div className="text-sm text-blue-800">
                  <strong>Destination Account:</strong>{" "}
                  {simulation.toAccount.code} - {simulation.toAccount.name}
                </div>
                <div className="text-sm text-blue-700">
                  Current Available:{" "}
                  {formatCurrency(simulation.toAccount.current_available)} →
                  After: {formatCurrency(simulation.toAccount.after_available)}
                </div>
              </div>
            </div>
          )}

          {/* Error Messages */}
          {errors.submit && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {errors.submit}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {errors.simulate && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {errors.simulate}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={simulateAdjustment}
              disabled={loading}
              className="px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Simulate Impact
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Adjustment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetAdjustmentModal;
