import React, { useState, useEffect } from "react";
import { fiscalYearAPI } from "../services/api";
import { X, AlertCircle, Calendar, AlertTriangle } from "lucide-react";

interface FiscalYearFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingFiscalYear?: any | null;
}

const FiscalYearForm: React.FC<FiscalYearFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingFiscalYear,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    start_date: "",
    end_date: "",
    is_current: false,
  });
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (isOpen) {
      if (editingFiscalYear) {
        setFormData({
          year: editingFiscalYear.year,
          start_date: editingFiscalYear.start_date.split("T")[0],
          end_date: editingFiscalYear.end_date.split("T")[0],
          is_current: editingFiscalYear.is_current,
        });
      } else {
        resetForm();
      }
    }
  }, [isOpen, editingFiscalYear]);

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: null }));
    }

    // Auto-calculate end date when start date or year changes
    if (field === "start_date" || field === "year") {
      const year = field === "year" ? value : formData.year;
      const startDate = field === "start_date" ? value : formData.start_date;

      if (startDate && year) {
        const start = new Date(startDate);
        const end = new Date(start);
        end.setFullYear(start.getFullYear() + 1);
        end.setDate(end.getDate() - 1); // Last day of fiscal year

        setFormData((prev) => ({
          ...prev,
          [field]: value,
          end_date: end.toISOString().split("T")[0],
        }));
        return;
      }
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.year || formData.year < 2000 || formData.year > 2100) {
      newErrors.year = "Valid year is required (2000-2100)";
    }

    if (!formData.start_date) {
      newErrors.start_date = "Start date is required";
    }

    if (!formData.end_date) {
      newErrors.end_date = "End date is required";
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);

      if (endDate <= startDate) {
        newErrors.end_date = "End date must be after start date";
      }

      // Check if fiscal year is reasonable (between 300-400 days)
      const durationDays = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (durationDays < 300 || durationDays > 400) {
        newErrors.end_date = "Fiscal year should be between 300-400 days";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const fiscalYearData = {
        year: formData.year,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_current: formData.is_current,
      };

      if (editingFiscalYear) {
        await fiscalYearAPI.updateFiscalYear(
          editingFiscalYear.id,
          fiscalYearData
        );
      } else {
        await fiscalYearAPI.createFiscalYear(fiscalYearData);
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      setErrors({
        submit:
          error.message ||
          `Failed to ${editingFiscalYear ? "update" : "create"} fiscal year`,
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1); // January 1st
    const endDate = new Date(currentYear, 11, 31); // December 31st

    setFormData({
      year: currentYear,
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
      is_current: false,
    });
    setErrors({});
  };

  const generatePresetDates = (
    type: "calendar" | "april" | "july" | "october"
  ) => {
    const year = formData.year;
    let startDate: Date;
    let endDate: Date;

    switch (type) {
      case "calendar":
        startDate = new Date(year, 0, 1); // January 1
        endDate = new Date(year, 11, 31); // December 31
        break;
      case "april":
        startDate = new Date(year, 3, 1); // April 1
        endDate = new Date(year + 1, 2, 31); // March 31 next year
        break;
      case "july":
        startDate = new Date(year, 6, 1); // July 1
        endDate = new Date(year + 1, 5, 30); // June 30 next year
        break;
      case "october":
        startDate = new Date(year, 9, 1); // October 1
        endDate = new Date(year + 1, 8, 30); // September 30 next year
        break;
    }

    setFormData((prev) => ({
      ...prev,
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            {editingFiscalYear ? "Edit Fiscal Year" : "Create New Fiscal Year"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fiscal Year *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="number"
                  min="2000"
                  max="2100"
                  value={formData.year}
                  onChange={(e) =>
                    handleFormChange(
                      "year",
                      parseInt(e.target.value) || new Date().getFullYear()
                    )
                  }
                  className={`block w-full pl-10 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.year ? "border-red-300" : ""
                  }`}
                  placeholder="2024"
                />
              </div>
              {errors.year && (
                <p className="mt-1 text-sm text-red-600">{errors.year}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="is_current"
                    value="true"
                    checked={formData.is_current === true}
                    onChange={() => handleFormChange("is_current", true)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Current Year
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="is_current"
                    value="false"
                    checked={formData.is_current === false}
                    onChange={() => handleFormChange("is_current", false)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Future/Past Year
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Date Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Common Fiscal Year Periods
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <button
                type="button"
                onClick={() => generatePresetDates("calendar")}
                className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Calendar Year
              </button>
              <button
                type="button"
                onClick={() => generatePresetDates("april")}
                className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Apr - Mar
              </button>
              <button
                type="button"
                onClick={() => generatePresetDates("july")}
                className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Jul - Jun
              </button>
              <button
                type="button"
                onClick={() => generatePresetDates("october")}
                className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Oct - Sep
              </button>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => handleFormChange("start_date", e.target.value)}
                className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.start_date ? "border-red-300" : ""
                }`}
              />
              {errors.start_date && (
                <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => handleFormChange("end_date", e.target.value)}
                className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.end_date ? "border-red-300" : ""
                }`}
              />
              {errors.end_date && (
                <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* Duration Preview */}
          {formData.start_date && formData.end_date && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Fiscal Year Preview
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Duration:</span>
                  <span className="ml-2 text-blue-900">
                    {(() => {
                      const start = new Date(formData.start_date);
                      const end = new Date(formData.end_date);
                      const days = Math.ceil(
                        (end.getTime() - start.getTime()) /
                          (1000 * 60 * 60 * 24)
                      );
                      const months = Math.round(days / 30.44);
                      return `${days} days (${months} months)`;
                    })()}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Period:</span>
                  <span className="ml-2 text-blue-900">
                    {new Date(formData.start_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    -{" "}
                    {new Date(formData.end_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Warning for Current Year */}
          {formData.is_current && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Setting as Current Fiscal Year
                  </h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    This will make this fiscal year the active budget period.
                    Any existing current fiscal year will be automatically
                    updated.
                  </p>
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
              {loading
                ? editingFiscalYear
                  ? "Updating..."
                  : "Creating..."
                : editingFiscalYear
                ? "Update Fiscal Year"
                : "Create Fiscal Year"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FiscalYearForm;
