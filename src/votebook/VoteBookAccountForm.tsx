import React, { useState, useEffect } from "react";
import { fiscalYearAPI, voteBookAPI } from "../services/api";
import { X, AlertCircle } from "lucide-react";
import NcoaLookup from "./NcoaLookup";

interface NcoaCode {
  id: number;
  code: string;
  economic_type: string;
  fg_title: string;
  state_title: string;
  lg_title: string;
  account_type: string;
  level: number;
  type: string;
}

interface VoteBookAccountFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const VoteBookAccountForm: React.FC<VoteBookAccountFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedNcoaCode, setSelectedNcoaCode] = useState<NcoaCode | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    fiscal_year_id: "",
    department_id: "",
    parent_id: "",
    account_class: "",
    allocation_base: "",
    carryover: "",
    soft_ceiling: false,
    hard_ceiling: true,
    approval_required: true,
  });
  const [errors, setErrors] = useState<any>({});
  const [fiscalYears, setFiscalYears] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [parentAccounts, setParentAccounts] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadFormData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedNcoaCode) {
      // Auto-populate name from NCOA title
      const title =
        selectedNcoaCode.fg_title ||
        selectedNcoaCode.state_title ||
        selectedNcoaCode.lg_title ||
        "";
      setFormData((prev) => ({
        ...prev,
        name: title,
      }));
    }
  }, [selectedNcoaCode]);

  const loadFormData = async () => {
    try {
      // Load fiscal years, departments, and parent accounts
      // This would typically come from separate API endpoints
      // For now, using mock data

      const fiscalYearResponse = await fiscalYearAPI.getFiscalYears();
      setFiscalYears(fiscalYearResponse?.fiscalYears);

      // const departmentResponse = await departmentAPI.getFiscalYears();
      // setFiscalYears(departmentResponse);

      setDepartments([
        { id: 1, name: "Finance Department", code: "FIN" },
        { id: 2, name: "Human Resources", code: "HR" },
        { id: 3, name: "Information Technology", code: "IT" },
        { id: 4, name: "Operations", code: "OPS" },
      ]);

      // Load existing accounts for parent selection
      const accountsResponse = await voteBookAPI.getAccounts();
      setParentAccounts(accountsResponse || []);
    } catch (error) {
      console.error("Failed to load form data:", error);
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: null }));
    }
  };

  const handleNcoaSelect = (code: NcoaCode) => {
    setSelectedNcoaCode(code);
    if (errors.ncoa_code) {
      setErrors((prev: any) => ({ ...prev, ncoa_code: null }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!selectedNcoaCode) newErrors.ncoa_code = "NCOA code is required";
    if (!formData.name.trim()) newErrors.name = "Account name is required";
    if (!formData.fiscal_year_id)
      newErrors.fiscal_year_id = "Fiscal year is required";
    if (!formData.account_class)
      newErrors.account_class = "Account class is required";
    if (!formData.allocation_base || parseFloat(formData.allocation_base) < 0) {
      newErrors.allocation_base = "Valid allocation amount is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const accountData = {
        code: selectedNcoaCode!.code,
        name: formData.name.trim(),
        description: formData.description.trim(),
        fiscal_year_id: parseInt(formData.fiscal_year_id),
        department_id: formData.department_id
          ? parseInt(formData.department_id)
          : undefined,
        parent_id: formData.parent_id
          ? parseInt(formData.parent_id)
          : undefined,
        account_type: mapNcoaToAccountType(selectedNcoaCode!.economic_type),
        account_class: formData.account_class,
        allocation_base: parseFloat(formData.allocation_base),
        carryover: parseFloat(formData.carryover) || 0,
        soft_ceiling: formData.soft_ceiling,
        hard_ceiling: formData.hard_ceiling,
        approval_required: formData.approval_required,
        ncoa_code_id: selectedNcoaCode!.id, // Store reference to NCOA code
      };

      await voteBookAPI.createAccount(accountData);

      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      setErrors({
        submit: error.message || "Failed to create vote book account",
      });
    } finally {
      setLoading(false);
    }
  };

  const mapNcoaToAccountType = (economicType: string): string => {
    const mapping = {
      Revenue: "revenue",
      Expenditures: "expense",
      Assets: "asset",
      Liabilities: "liability",
    };
    return mapping[economicType as keyof typeof mapping] || "expense";
  };

  const resetForm = () => {
    setSelectedNcoaCode(null);
    setFormData({
      name: "",
      description: "",
      fiscal_year_id: "",
      department_id: "",
      parent_id: "",
      account_class: "",
      allocation_base: "",
      carryover: "",
      soft_ceiling: false,
      hard_ceiling: true,
      approval_required: true,
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-3xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            Create New Vote Book Account
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* NCOA Code Selection */}
          <NcoaLookup
            onSelect={handleNcoaSelect}
            selectedCode={selectedNcoaCode}
          />
          {errors.ncoa_code && (
            <p className="mt-1 text-sm text-red-600">{errors.ncoa_code}</p>
          )}

          {/* Account Details */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.name ? "border-red-300" : ""
                }`}
                placeholder="Account name (auto-filled from NCOA)"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Class *
              </label>
              <select
                value={formData.account_class}
                onChange={(e) =>
                  handleFormChange("account_class", e.target.value)
                }
                className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.account_class ? "border-red-300" : ""
                }`}
              >
                <option value="">Select Class</option>
                <option value="operational">Operational</option>
                <option value="capital">Capital</option>
                <option value="personnel">Personnel</option>
                <option value="maintenance">Maintenance</option>
                <option value="emergency">Emergency</option>
              </select>
              {errors.account_class && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.account_class}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fiscal Year *
              </label>
              <select
                value={formData.fiscal_year_id}
                onChange={(e) =>
                  handleFormChange("fiscal_year_id", e.target.value)
                }
                className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.fiscal_year_id ? "border-red-300" : ""
                }`}
              >
                <option value="">Select Fiscal Year</option>
                {fiscalYears.map((fy) => (
                  <option key={fy.id} value={fy.id}>
                    {fy.year} {fy.is_current ? "(Current)" : ""}
                  </option>
                ))}
              </select>
              {errors.fiscal_year_id && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.fiscal_year_id}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                value={formData.department_id}
                onChange={(e) =>
                  handleFormChange("department_id", e.target.value)
                }
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Select Department (Optional)</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.code} - {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent Account
              </label>
              <select
                value={formData.parent_id}
                onChange={(e) => handleFormChange("parent_id", e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Select Parent Account (Optional)</option>
                {parentAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.code} - {account.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Allocation *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.allocation_base}
                  onChange={(e) =>
                    handleFormChange("allocation_base", e.target.value)
                  }
                  className={`block w-full pl-7 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.allocation_base ? "border-red-300" : ""
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.allocation_base && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.allocation_base}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Carryover Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.carryover}
                  onChange={(e) =>
                    handleFormChange("carryover", e.target.value)
                  }
                  className="block w-full pl-7 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => handleFormChange("description", e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Optional description of the account purpose"
            />
          </div>

          {/* Account Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Account Settings
            </label>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.soft_ceiling}
                  onChange={(e) =>
                    handleFormChange("soft_ceiling", e.target.checked)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Soft Ceiling (Allow overruns with approval)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.hard_ceiling}
                  onChange={(e) =>
                    handleFormChange("hard_ceiling", e.target.checked)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Hard Ceiling (Block overruns completely)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.approval_required}
                  onChange={(e) =>
                    handleFormChange("approval_required", e.target.checked)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Approval Required for Transactions
                </label>
              </div>
            </div>
          </div>

          {/* NCOA Code Preview */}
          {selectedNcoaCode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Selected NCOA Code
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Code:</span>
                  <span className="ml-2 text-blue-900">
                    {selectedNcoaCode.code}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">
                    Economic Type:
                  </span>
                  <span className="ml-2 text-blue-900">
                    {selectedNcoaCode.economic_type}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Level:</span>
                  <span className="ml-2 text-blue-900">
                    {selectedNcoaCode.level}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Type:</span>
                  <span className="ml-2 text-blue-900">
                    {selectedNcoaCode.type}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-blue-700 font-medium">Title:</span>
                  <span className="ml-2 text-blue-900">
                    {selectedNcoaCode.fg_title ||
                      selectedNcoaCode.state_title ||
                      selectedNcoaCode.lg_title}
                  </span>
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
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VoteBookAccountForm;
