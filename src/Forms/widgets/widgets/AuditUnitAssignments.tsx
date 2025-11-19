import React from "react";

type EmployeeOption = {
  id: string | number;
  value: string | number;
  label: string;
};

type Errors = Record<string, string | undefined>;

interface AuditUnitAssignmentsProps {
  title?: string;
  formData: Record<string, any>;
  errors: Errors;
  employeeOptions?: EmployeeOption[];
  isEnabled: (fieldName: string) => boolean;
  inputClass: (fieldName: string) => string;
  handleInput: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
}

const AuditUnitAssignments: React.FC<AuditUnitAssignmentsProps> = ({
  title = "Audit Unit",
  formData,
  errors,
  employeeOptions = [],
  isEnabled,
  inputClass,
  handleInput,
}) => {
  return (
    <div className="mt-2">
      <h3 className="text-l font-semibold text-gray-700 mb-1">{title}</h3>

      <div className="flex flex-col sm:flex-row p-1 border rounded-lg border-gray-200 gap-1">
        {/* Pass / Query remarks */}
        <div className="flex-1">
          <div className="mt-1">
            <label
              htmlFor="auditRemarkPass"
              className="block text-sm font-medium text-gray-600"
            >
              Pass
            </label>
            <div>
              <textarea
                name="auditRemarkPass"
                id="auditRemarkPass"
                value={formData?.auditRemarkPass ?? ""}
                onChange={handleInput}
                disabled={!isEnabled("auditRemarkPass")}
                className={inputClass("auditRemarkPass")}
                rows={2}
                placeholder="Enter Additional Notes or Comments"
              />
              {errors.auditRemarkPass && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.auditRemarkPass}
                </p>
              )}
            </div>
          </div>

          <div className="mt-1">
            <label
              htmlFor="auditRemarkQuery"
              className="block text-sm font-medium text-gray-600"
            >
              Query
            </label>
            <div>
              <textarea
                name="auditRemarkQuery"
                id="auditRemarkQuery"
                value={formData?.auditRemarkQuery ?? ""}
                onChange={handleInput}
                disabled={!isEnabled("auditRemarkQuery")}
                className={inputClass("auditRemarkQuery")}
                rows={2}
                placeholder="Enter Additional Notes or Comments"
              />
              {errors.auditRemarkQuery && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.auditRemarkQuery}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Audit checker / reviewer / remarker */}
        <div className="flex-1">
          {/* Audit Checker */}
          <div>
            <label
              htmlFor="auditCheckedById"
              className="block text-sm font-medium text-gray-600"
            >
              Audit Checker:
            </label>
            <div className="flex gap-1">
              <select
                name="auditCheckedById"
                id="auditCheckedById"
                value={formData?.auditCheckedById ?? ""}
                onChange={handleInput}
                className={inputClass("auditCheckedById")}
              >
                <option value="">Select an option</option>
                {employeeOptions.map((employee) => (
                  <option key={employee.id} value={employee.value}>
                    {employee.label}
                  </option>
                ))}
              </select>
              <input
                name="auditCheckedByDate"
                id="auditCheckedByDate"
                value={formData?.auditCheckedByDate ?? ""}
                onChange={handleInput}
                disabled={!isEnabled("auditCheckedByDate")}
                className={inputClass("auditCheckedByDate")}
                type="date"
              />
            </div>
            {errors.auditCheckedById && (
              <p className="text-xs text-red-600 mt-1">
                {errors.auditCheckedById}
              </p>
            )}
          </div>

          {/* Audit Reviewer */}
          <div className="mt-3">
            <label
              htmlFor="auditReviewedById"
              className="block text-sm font-medium text-gray-600"
            >
              Audit Reviewer
            </label>
            <div className="flex gap-1">
              <select
                name="auditReviewedById"
                id="auditReviewedById"
                value={formData?.auditReviewedById ?? ""}
                onChange={handleInput}
                disabled={!isEnabled("auditReviewedById")}
                className={inputClass("auditReviewedById")}
              >
                <option value="">Select an option</option>
                {employeeOptions.map((employee) => (
                  <option key={employee.id} value={employee.value}>
                    {employee.label}
                  </option>
                ))}
              </select>
              <input
                name="auditReviewedByDate"
                id="auditReviewedByDate"
                value={formData?.auditReviewedByDate ?? ""}
                onChange={handleInput}
                disabled={!isEnabled("auditReviewedByDate")}
                className={inputClass("auditReviewedByDate")}
                type="date"
              />
            </div>
            {errors.auditReviewedById && (
              <p className="text-xs text-red-600 mt-1">
                {errors.auditReviewedById}
              </p>
            )}
          </div>

          {/* Audit Remarker */}
          <div className="mt-3">
            <label
              htmlFor="auditRemarkedById"
              className="block text-sm font-medium text-gray-600"
            >
              Audit Remarker
            </label>
            <div className="flex gap-1">
              <select
                name="auditRemarkedById"
                id="auditRemarkedById"
                value={formData?.auditRemarkedById ?? ""}
                onChange={handleInput}
                disabled={!isEnabled("auditRemarkedById")}
                className={inputClass("auditRemarkedById")}
              >
                <option value="">Select an option</option>
                {employeeOptions.map((employee) => (
                  <option key={employee.id} value={employee.value}>
                    {employee.label}
                  </option>
                ))}
              </select>
              <input
                name="auditApprovedByDate"
                id="auditApprovedByDate"
                value={formData?.auditApprovedByDate ?? ""}
                onChange={handleInput}
                disabled={!isEnabled("auditApprovedByDate")}
                className={inputClass("auditApprovedByDate")}
                type="date"
              />
            </div>
            {errors.auditRemarkedById && (
              <p className="text-xs text-red-600 mt-1">
                {errors.auditRemarkedById}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditUnitAssignments;
