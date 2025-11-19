import React, {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type RefObject,
} from "react";
import { useOrganization } from "../../GlobalContexts/Organization-Context";
import { useAuth } from "../../GlobalContexts/AuthContext";
import moment from "moment";
import { generateVoucherCode, getFinanceCode } from "../../common/methods";
import FormActions from "./FormActions";

export interface PersonnelType {
  id: number;
  name: string | number;
  positionName: string;
  date: Date;
}
export interface VoucherPersonnels {
  headOfUnit: PersonnelType;
  preparedBy: PersonnelType;
  reviewedBy: PersonnelType;
  approvedBy: PersonnelType;
  unitHeadBy: PersonnelType;
}

export interface VoucherPersonnelsAssignmentDataType {
  voucherNo: string;
  departmentCode: string;
  applicationDate: Date | string;
  applicantName?: string;
  applicantAddress?: string;
  applicantDescription?: string;
  paymentDate?: string;
  paymentParticles?: string;
  accountTitle?: string;
  accountCodeNo?: string;
  debitAmount?: string;
  debitDescription?: string;
  creditAmount?: string;
  creditDescription?: string;
  unitVoucherHeadById?: string | number;
  preparedById?: string | number;
  reviewedById?: string | number;
  approvedById?: string | number;
  auditRemarkPass?: string;
  auditRemarkQuery?: string;
  auditCheckedById?: string | number;
  auditCheckedByDate?: string;
  auditReviewedById?: string | number;
  auditReviewedByDate?: string;
  auditRemarkedById?: string | number;
  auditApprovedByDate?: string;
  cpoHeadById?: string | number;
  cpoPreparedById?: string | number;
  cpoReviewedById?: string | number;
  cpoApprovedById?: string | number;
  additionalNotes?: string;
  financeCode?: string;
  [key: string]: any;
  voucherPersonnels?: VoucherPersonnels;
}

type CompletedStage = {
  step: number | string;
  updatedAt: string | Date;
  assignedTo: {
    firstName: string;
    lastName: string;
    department?: { name: string };
    position?: { title: string };
    [k: string]: any;
  };
};

type EmployeeOption = {
  id: string | number;
  value: string | number;
  label: string;
};

export interface VoucherPersonnelsAssignmentProps {
  loading: boolean;
  setLoading: (value: boolean) => void;
  formResponses: Partial<VoucherPersonnelsAssignmentDataType>;
  enableInputList?: string[];
  vissibleSections?: string[];
  showApplicationFormTitle?: boolean;
  instruction?: string;
  onSubmit: (data: VoucherPersonnelsAssignmentDataType, status: string) => void;
  onCancel: () => void;
  showActionButtons?: boolean;
  mode?: "edit" | "preview" | "new" | "in_progress" | "view";
  responseTypes: string[];
  completedStages?: CompletedStage[];
  showTobe?: boolean;
}

// ---- Component ----
const VoucherPersonnelsAssignment: React.FC<
  VoucherPersonnelsAssignmentProps
> = ({
  formResponses,
  enableInputList = [""],
  vissibleSections = [],
  instruction = "",
  onSubmit,
  onCancel,
  showActionButtons = false,
  mode = "new",
  responseTypes = [""],
  completedStages = [],
  loading = false,
  setLoading,
}) => {
  const componentRef = useRef<HTMLElement>(null);
  const { user } = useAuth();
  const { userDepartmenttMembers } = useOrganization();
  const employeeOptions: EmployeeOption[] =
    (userDepartmenttMembers?.rows?.map((employee: any) => ({
      id: employee.id,
      value: employee.id,
      label: `${employee.firstName} - ${employee.lastName} `,
    })) as EmployeeOption[]) ?? [];

  const [hasErrors, setHasErrors] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<VoucherPersonnelsAssignmentDataType>(
    {
      financeCode: getFinanceCode(user),
      voucherNo: generateVoucherCode(),
      ...formResponses,
      departmentCode: formResponses?.departmentCode || "",
      applicationDate: formResponses?.applicationDate || new Date(),
    }
  );

  // helpers
  const isEnabled = (name: string) => enableInputList.includes(name);
  const isVisible = (section: string) =>
    mode === "preview" || vissibleSections?.includes(section);

  const inputClass = (
    name: string,
    base = "mt-0 w-full p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  ) =>
    [
      base,
      "border",
      errors[name] ? "border-red-600 ring-1 ring-red-300" : "border-gray-300",
    ].join(" ");

  // input handler
  const handleInput = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      return { ...prevData, [name]: value };
    });
    // clear error as user types
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  useEffect(() => {
    setFormData((prev) => ({ ...prev, ...formResponses }));
  }, [formResponses]);

  // ===== Validation =====
  const getRequiredFields = (): string[] => {
    const req = new Set<string>();
    const addIfEnabled = (f: string) => {
      if (isEnabled(f)) req.add(f);
    };

    // Voucher Approval — ALWAYS when section visible (no triggerVoucherCreation)
    if (isVisible("voucherApproval")) {
      [
        "unitVoucherHeadById",
        "preparedById",
        "reviewedById",
        "approvedById",
      ].forEach(addIfEnabled);
    }

    return Array.from(req);
  };

  const validate = (): Record<string, string> => {
    const toCheck = getRequiredFields();
    const nextErrors: Record<string, string> = {};
    for (const field of toCheck) {
      const v = (formData as any)?.[field];
      const empty =
        v === undefined ||
        v === null ||
        (typeof v === "string" && v.trim() === "");
      if (empty) {
        // human-ish labels
        const label = field
          .replace(/Id$/, " Id")
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (s) => s.toUpperCase());
        nextErrors[field] = `${label} is required`;
      }
    }
    return nextErrors;
  };

  const handleSubmit = (status: string) => {
    const nextErrors = validate();
    setErrors(nextErrors);
    const hasErr = Object.keys(nextErrors).length > 0;
    setHasErrors(hasErr);

    if (!hasErr) {
      setLoading(true);
      onSubmit({ ...formData }, status);
    }
  };

  const handleCancel = () => {
    setFormData({} as VoucherPersonnelsAssignmentDataType);
    onCancel();
  };

  // type for getSignerProps param
  function getSignerProps(approver: {
    stepNumber: number;
    bottomComment?: string;
  }) {
    const completedStage =
      completedStages &&
      completedStages.find(
        (comStage) => Number(comStage.step) === approver.stepNumber
      );
    if (!completedStage) return undefined;
    const assignee = completedStage.assignedTo;
    return {
      firstName: assignee?.firstName,
      lastName: assignee?.lastName,
      date:
        completedStage?.updatedAt &&
        moment(completedStage?.updatedAt).format("DD/MM/YYYY"),
      department: assignee?.department?.name,
      position: assignee?.position?.title,
      label: approver.bottomComment,
    };
  }

  // --- RENDER --- //
  return (
    <div
      ref={componentRef as RefObject<HTMLDivElement>}
      className="bg-white rounded-lg sm:p-1 w-full max-w-4xl"
    >
      {hasErrors && (
        <div className="bg-red-50 p-4 rounded-lg mb-2">
          <p className="text-red-800 text-sm">
            There are some errors or missing required fields
          </p>
        </div>
      )}

      {instruction && (
        <div className="bg-yellow-50 p-4 rounded-lg mb-2">
          <p className="text-yellow-800 text-sm">{instruction}</p>
        </div>
      )}

      {/* Voucher Approval (no triggerVoucherCreation; required when visible) */}
      {/* {isVisible("voucherApproval") && ( */}
      <div className="mt-2">
        <h3 className="text-l font-semibold text-gray-700 mb-1">
          Voucher Approval
        </h3>
        <div className="p-1 border rounded-lg border-gray-200">
          <div className="">
            <label className=" text-sm font-medium text-gray-600">
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
              {employeeOptions?.map((employee) => (
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
            {[
              {
                name: "preparedById",
                label: "To be Prepared By",
                stepNumber: 2,
              },
              {
                name: "reviewedById",
                label: "To be Reviewed By",
                stepNumber: 3,
              },
              {
                name: "approvedById",
                label: "To be Approved By",
                stepNumber: 4,
              },
            ].map((role) => (
              <div key={role.name}>
                <label className="block text-sm font-medium text-gray-600">
                  {role.label}
                </label>
                {getSignerProps({ stepNumber: role.stepNumber }) ? (
                  <div className="mt-0 w-full p-1 border border-gray-300 rounded-md">
                    {getSignerProps({ stepNumber: role.stepNumber })?.firstName}{" "}
                    {getSignerProps({ stepNumber: role.stepNumber })?.lastName}
                  </div>
                ) : (
                  <>
                    <select
                      name={role.name}
                      id={role.name}
                      value={(formData as any)?.[role.name] ?? ""}
                      onChange={handleInput}
                      disabled={!isEnabled(role.name)}
                      className={inputClass(role.name)}
                    >
                      <option value="">Select an option</option>
                      {employeeOptions?.map((employee) => (
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
            ))}
          </div>
        </div>
      </div>
      {/* )} */}

      {/* Action Buttons */}
      {showActionButtons && (
        <FormActions
          loading={loading}
          handleCancel={handleCancel}
          mode={mode}
          handleSubmit={handleSubmit}
          responseTypes={responseTypes}
        />
      )}
    </div>
  );
};

export default VoucherPersonnelsAssignment;
