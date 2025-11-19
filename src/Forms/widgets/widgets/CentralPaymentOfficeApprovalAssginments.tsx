import React from "react";

type EmployeeOption = {
  id: string | number;
  value: string | number;
  label: string;
};

type Errors = Record<string, string | undefined>;

interface CentralPaymentOfficeApprovalAssignmentsProps {
  title?: string;
  formData: Record<string, any>;
  errors: Errors;
  employeeOptions?: EmployeeOption[];
  isEnabled: (fieldName: string) => boolean;
  inputClass: (fieldName: string) => string;
  handleInput: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const CentralPaymentOfficeApprovalAssignments: React.FC<
  CentralPaymentOfficeApprovalAssignmentsProps
> = ({
  title = "Central Payment Office Approval",
  formData,
  errors,
  employeeOptions = [],
  isEnabled,
  inputClass,
  handleInput,
}) => {
  const roles = [
    { name: "cpoPreparedById", label: "Payment Initiator" },
    { name: "cpoReviewedById", label: "Payment Reviewer" },
    { name: "cpoApprovedById", label: "Payment Approver" },
  ] as const;

  return (
    <div className="mt-2">
      <h3 className="text-l font-semibold text-gray-700 mb-1">{title}</h3>

      <div className="p-1 border rounded-lg border-gray-200">
        {/* Head of Unit [CPO] */}
        <div>
          <label
            htmlFor="cpoHeadById"
            className="text-sm font-medium text-gray-600"
          >
            Head of Unit [CPO]
          </label>
          <select
            name="cpoHeadById"
            id="cpoHeadById"
            value={formData?.cpoHeadById ?? ""}
            onChange={handleInput}
            disabled={!isEnabled("cpoHeadById")}
            className={inputClass("cpoHeadById")}
          >
            <option value="">Select an option</option>
            {employeeOptions.map((employee) => (
              <option key={employee.id} value={employee.value}>
                {employee.label}
              </option>
            ))}
          </select>
          {errors.cpoHeadById && (
            <p className="text-xs text-red-600 mt-1">{errors.cpoHeadById}</p>
          )}
        </div>

        {/* Other roles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 mt-1">
          {roles.map((role) => (
            <div key={role.name}>
              <label
                htmlFor={role.name}
                className="text-xs font-medium text-gray-600"
              >
                {role.label}
              </label>
              <select
                name={role.name}
                id={role.name}
                value={formData?.[role.name] ?? ""}
                onChange={handleInput}
                disabled={!isEnabled(role.name)}
                className={inputClass(role.name)}
              >
                <option value="">Select an option</option>
                {employeeOptions.map((employee) => (
                  <option key={employee.id} value={employee.value}>
                    {employee.label}
                  </option>
                ))}
              </select>
              {errors[role.name] && (
                <p className="text-xs text-red-600 mt-1">{errors[role.name]}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CentralPaymentOfficeApprovalAssignments;
