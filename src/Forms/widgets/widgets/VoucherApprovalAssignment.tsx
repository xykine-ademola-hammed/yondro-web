import React from "react";

type EmployeeOption = {
  id: string | number;
  value: string | number;
  label: string;
};

type Errors = Record<string, string | undefined>;

interface Signer {
  firstName?: string;
  lastName?: string;
}

interface GetSignerPropsArgs {
  stepNumber: number;
}

interface VoucherApprovalAssignmentProps {
  title?: string;
  formData: Record<string, any>;
  errors: Errors;
  employeeOptions?: EmployeeOption[];
  isEnabled: (fieldName: string) => boolean;
  inputClass: (fieldName: string) => string;
  handleInput: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  getSignerProps: (args: GetSignerPropsArgs) => Signer | undefined;
}

const VoucherApprovalAssignment: React.FC<VoucherApprovalAssignmentProps> = ({
  title = "Voucher Approval",
  formData,
  errors,
  employeeOptions = [],
  isEnabled,
  inputClass,
  handleInput,
  getSignerProps,
}) => {
  const roles = [
    { name: "preparedById", label: "Prepared By", stepNumber: 2 },
    { name: "reviewedById", label: "Reviewed By", stepNumber: 3 },
    { name: "approvedById", label: "Approved By", stepNumber: 4 },
  ] as const;

  return (
    <div className="mt-2">
      <h3 className="text-l font-semibold text-gray-700 mb-1">{title}</h3>

      <div className="p-1 border rounded-lg border-gray-200">
        {/* Head of Unit [Voucher] */}
        <div>
          <label
            htmlFor="unitVoucherHeadById"
            className="text-sm font-medium text-gray-600"
          >
            Head of Unit [Voucher]
          </label>
          <select
            name="unitVoucherHeadById"
            id="unitVoucherHeadById"
            value={formData?.unitVoucherHeadById ?? ""}
            onChange={handleInput}
            disabled={!isEnabled("unitVoucherHeadById")}
            className={inputClass("unitVoucherHeadById")}
          >
            <option value="">Select an option</option>
            {employeeOptions.map((employee) => (
              <option key={employee.id} value={employee.value}>
                {employee.label}
              </option>
            ))}
          </select>
          {errors.unitVoucherHeadById && (
            <p className="text-xs text-red-600 mt-1">
              {errors.unitVoucherHeadById}
            </p>
          )}
        </div>

        {/* Prepared / Reviewed / Approved */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 mt-1">
          {roles.map((role) => {
            const signer = getSignerProps({ stepNumber: role.stepNumber });

            return (
              <div key={role.name}>
                <label
                  htmlFor={role.name}
                  className="block text-sm font-medium text-gray-600"
                >
                  {role.label}
                </label>

                {signer ? (
                  <div className="mt-0 w-full p-1 border border-gray-300 rounded-md text-sm text-gray-800 bg-gray-50">
                    {signer.firstName} {signer.lastName}
                  </div>
                ) : (
                  <>
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
                      <p className="text-xs text-red-600 mt-1">
                        {errors[role.name]}
                      </p>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VoucherApprovalAssignment;
