import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { voucherAPI } from "../services/api";
import { Plus, Trash2, Save, Send, AlertCircle } from "lucide-react";
import VoucherAccountLookup from "./VoucherAccountLookup";

interface VoucherLine {
  account_id: number | null;
  description: string;
  quantity: number;
  unit_cost: number;
  total_amount: number;
  tax_amount: number;
  selectedAccount?: VoteBookAccount | null;
}

interface VoteBookAccount {
  id: number;
  code: string;
  name: string;
  balances: {
    available: number;
  };
  NcoaCode?: {
    code: string;
    economic_type: string;
    fg_title: string;
    state_title: string;
    lg_title: string;
    level: number;
  };
}

const VoucherCreate: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    payee_name: "",
    payee_address: "",
    purpose: "",
    currency: "USD",
    priority: "medium",
    due_date: "",
    invoice_number: "",
    po_number: "",
    notes: "",
  });

  const [lines, setLines] = useState<VoucherLine[]>([
    {
      account_id: null,
      description: "",
      quantity: 1,
      unit_cost: 0,
      total_amount: 0,
      tax_amount: 0,
      selectedAccount: null,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<any>({});

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev: any) => ({ ...prev, [field]: null }));
    }
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const updatedLines = [...lines];
    updatedLines[index] = { ...updatedLines[index], [field]: value };

    // Recalculate total amount for quantity and unit_cost changes
    if (field === "quantity" || field === "unit_cost") {
      updatedLines[index].total_amount =
        updatedLines[index].quantity * updatedLines[index].unit_cost;
    }

    setLines(updatedLines);
  };

  const handleAccountSelect = (index: number, account: VoteBookAccount) => {
    const updatedLines = [...lines];
    updatedLines[index] = {
      ...updatedLines[index],
      account_id: account.id,
      selectedAccount: account,
    };
    setLines(updatedLines);

    // Clear validation error for this line
    if (validationErrors[`line_${index}_account`]) {
      setValidationErrors((prev: any) => ({
        ...prev,
        [`line_${index}_account`]: null,
      }));
    }
  };

  const addLine = () => {
    setLines([
      ...lines,
      {
        account_id: null,
        description: "",
        quantity: 1,
        unit_cost: 0,
        total_amount: 0,
        tax_amount: 0,
        selectedAccount: null,
      },
    ]);
  };

  const removeLine = (index: number) => {
    if (lines.length > 1) {
      setLines(lines.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    const errors: any = {};

    if (!formData.payee_name) errors.payee_name = "Payee name is required";
    if (!formData.purpose) errors.purpose = "Purpose is required";

    lines.forEach((line, index) => {
      if (!line.account_id || line.account_id === null)
        errors[`line_${index}_account`] = "Account is required";
      if (!line.description)
        errors[`line_${index}_description`] = "Description is required";
      if (line.unit_cost <= 0)
        errors[`line_${index}_unit_cost`] = "Unit cost must be greater than 0";
      if (line.quantity <= 0)
        errors[`line_${index}_quantity`] = "Quantity must be greater than 0";
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const calculateTotals = () => {
    const totalAmount = lines.reduce((sum, line) => sum + line.total_amount, 0);
    const totalTax = lines.reduce((sum, line) => sum + line.tax_amount, 0);
    const netAmount = totalAmount - totalTax;

    return { totalAmount, totalTax, netAmount };
  };

  const handleSave = async (submit = false) => {
    if (!validateForm()) {
      setError("Please fix the errors below");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { totalAmount, totalTax, netAmount } = calculateTotals();

      const voucherData = {
        ...formData,
        lines: lines
          .filter((line) => line.account_id && line.description)
          .map((line) => ({
            account_id: line.account_id,
            description: line.description,
            quantity: line.quantity,
            unit_cost: line.unit_cost,
            total_amount: line.total_amount,
            tax_amount: line.tax_amount,
          })),
        total_amount: totalAmount,
        tax_amount: totalTax,
        net_amount: netAmount,
      };

      const response = await voucherAPI.createVoucher(voucherData);

      if (submit) {
        await voucherAPI.submitVoucher(response.id);
      }

      navigate(`/vouchers/${response.id}`);
    } catch (error: any) {
      setError(error.message || "Failed to create voucher");
    } finally {
      setLoading(false);
    }
  };

  const { totalAmount, totalTax, netAmount } = calculateTotals();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create New Voucher</h1>
        <p className="mt-1 text-sm text-gray-600">
          Create a new payment voucher for approval and processing
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
        {/* Basic Information */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Payee Name *
              </label>
              <input
                type="text"
                value={formData.payee_name}
                onChange={(e) => handleFormChange("payee_name", e.target.value)}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  validationErrors.payee_name ? "border-red-300" : ""
                }`}
                placeholder="Enter payee name"
              />
              {validationErrors.payee_name && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.payee_name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleFormChange("priority", e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Payee Address
              </label>
              <textarea
                rows={3}
                value={formData.payee_address}
                onChange={(e) =>
                  handleFormChange("payee_address", e.target.value)
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter payee address"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Purpose *
              </label>
              <textarea
                rows={3}
                value={formData.purpose}
                onChange={(e) => handleFormChange("purpose", e.target.value)}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  validationErrors.purpose ? "border-red-300" : ""
                }`}
                placeholder="Describe the purpose of this payment"
              />
              {validationErrors.purpose && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.purpose}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => handleFormChange("due_date", e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Invoice Number
              </label>
              <input
                type="text"
                value={formData.invoice_number}
                onChange={(e) =>
                  handleFormChange("invoice_number", e.target.value)
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter invoice number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                PO Number
              </label>
              <input
                type="text"
                value={formData.po_number}
                onChange={(e) => handleFormChange("po_number", e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter PO number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => handleFormChange("currency", e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => handleFormChange("notes", e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Additional notes or comments"
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">Line Items</h2>
            <button
              type="button"
              onClick={addLine}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Line
            </button>
          </div>

          <div className="space-y-4">
            {lines.map((line, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900">
                    Line {index + 1}
                  </h3>
                  {lines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLine(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="lg:col-span-3">
                    <VoucherAccountLookup
                      onSelect={(account) =>
                        handleAccountSelect(index, account)
                      }
                      selectedAccount={line.selectedAccount}
                      error={validationErrors[`line_${index}_account`]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      min="0.001"
                      step="0.001"
                      value={line.quantity}
                      onChange={(e) =>
                        handleLineChange(
                          index,
                          "quantity",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        validationErrors[`line_${index}_quantity`]
                          ? "border-red-300"
                          : ""
                      }`}
                    />
                    {validationErrors[`line_${index}_quantity`] && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors[`line_${index}_quantity`]}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Description *
                    </label>
                    <textarea
                      rows={2}
                      value={line.description}
                      onChange={(e) =>
                        handleLineChange(index, "description", e.target.value)
                      }
                      className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        validationErrors[`line_${index}_description`]
                          ? "border-red-300"
                          : ""
                      }`}
                      placeholder="Describe this line item"
                    />
                    {validationErrors[`line_${index}_description`] && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors[`line_${index}_description`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Unit Cost *
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={line.unit_cost}
                      onChange={(e) =>
                        handleLineChange(
                          index,
                          "unit_cost",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        validationErrors[`line_${index}_unit_cost`]
                          ? "border-red-300"
                          : ""
                      }`}
                    />
                    {validationErrors[`line_${index}_unit_cost`] && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors[`line_${index}_unit_cost`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tax Amount
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.tax_amount}
                      onChange={(e) =>
                        handleLineChange(
                          index,
                          "tax_amount",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Total Amount
                    </label>
                    <input
                      type="number"
                      value={line.total_amount.toFixed(2)}
                      readOnly
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 border-t border-gray-200 pt-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal:</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax:</span>
                  <span>${totalTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-medium border-t border-gray-200 pt-2">
                  <span>Total:</span>
                  <span>${netAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate("/vouchers")}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? "Submitting..." : "Save & Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VoucherCreate;
