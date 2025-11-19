import React, {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type RefObject,
} from "react";
import { useAuth } from "../../GlobalContexts/AuthContext";
import moment from "moment";
import useDownloadPdf from "../../common/hooks/useDownloadPdf";
import Signer from "../../components/Signer";
import { getFinanceCode } from "../../common/methods";
import spedLogo from "../../assets/spedLogo.png";
import FormActions from "./FormActions";
import { useOrganization } from "../../GlobalContexts/Organization-Context";
import DocumentAttachmentForm from "./DocumentAttachmentForm";
import type { Approver } from "./ClaimOutOfPocketExpenses";
import type { EmployeeOption } from "./PaymentVoucher-Tetfund";

interface Requestor {
  firstName?: string;
  lastName?: string;
  date?: string;
  department?: string;
  position?: string;
}

interface RequestForPurchaseOrSpecialAdvanceForm {
  // always-present / autofilled
  date: string;
  requestorDeligation?: string;

  // text inputs in this UI
  officerName?: string;
  rank?: string;
  contiss?: string;
  compNo?: string;
  purpose?: string;
  bank?: string;
  accountNumber?: string;
  outstandingBalance?: string;
  advanceAmount?: string;
  totalInWord?: string;

  // voucher approval (conditional)
  unitVoucherHeadById?: string;

  // other props kept for compatibility
  location?: string;
  description?: string;
  recommendationNotes?: string;
  requestor?: Requestor;
  approvers?: Approver[];
  attachments?: any[];

  // for compatibility with spread
  [key: string]: any;
}

interface RequestForPurchaseOrSpecialAdvanceProps {
  loading: boolean;
  setLoading: (value: boolean) => void;
  formResponses: Partial<RequestForPurchaseOrSpecialAdvanceForm>;
  enableInputList?: string[];
  triggerVoucherCreation?: boolean;
  vissibleSections?: string[];
  onSubmit: (
    data: RequestForPurchaseOrSpecialAdvanceForm,
    status: string
  ) => void;
  onCancel: () => void;
  showActionButtons?: boolean;
  mode?: "edit" | "preview" | "new" | "in_progress";
  responseTypes: string[];
  showApprovers?: boolean;
  showAddDocument?: boolean;
}

const ALWAYS_REQUIRED: (keyof RequestForPurchaseOrSpecialAdvanceForm)[] = [
  "date",
  "requestorDeligation",
];

// These are the fields rendered in this component that should be required when enabled/visible:
const UI_REQUIRED: (keyof RequestForPurchaseOrSpecialAdvanceForm)[] = [
  "officerName",
  "rank",
  "contiss",
  "compNo",
  "purpose",
  "bank",
  "accountNumber",
  "outstandingBalance",
  "advanceAmount",
  "totalInWord",
];

const RequestForPurchaseOrSpecialAdvance: React.FC<
  RequestForPurchaseOrSpecialAdvanceProps
> = ({
  formResponses,
  enableInputList = [""],
  onSubmit,
  onCancel,
  showActionButtons = false,
  mode = "new",
  responseTypes = [""],
  triggerVoucherCreation,
  loading = false,
  setLoading,
  showApprovers = true,
  showAddDocument = true,
}) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const downloadPdf = useDownloadPdf();
  const { user } = useAuth();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasErrors, setHasErrors] = useState<boolean>(false);

  const [formData, setFormData] =
    useState<RequestForPurchaseOrSpecialAdvanceForm>({
      date: moment(new Date()).format("YYYY-MM-DD"),
      requestorDeligation: getFinanceCode(user),
      ...formResponses,
    });
  const { userDepartmenttMembers } = useOrganization();
  // Type safety for employee options
  const employeeOptions: EmployeeOption[] =
    (userDepartmenttMembers?.rows?.map((employee: any) => ({
      id: employee.id,
      value: employee.id,
      label: `${employee.firstName} - ${employee.lastName} `,
    })) as EmployeeOption[]) ?? [];

  const handleInputChange = (
    fieldId: keyof RequestForPurchaseOrSpecialAdvanceForm,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    // Clear error for this field once user types
    setErrors((prev) => {
      const next = { ...prev };
      delete next[fieldId as string];
      return next;
    });
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      ...formResponses,
    }));
  }, [formResponses]);

  const isEnabled = (name: string) => enableInputList.includes(name);

  /**
   * Build the set of required fields at submit-time:
   * - ALWAYS_REQUIRED are always required (auto-filled but validated).
   * - UI_REQUIRED are required only if enabled (visible/editable).
   * - Voucher approver is required only if triggerVoucherCreation is true AND it is enabled.
   */
  const getRequiredFields =
    (): (keyof RequestForPurchaseOrSpecialAdvanceForm)[] => {
      const required: (keyof RequestForPurchaseOrSpecialAdvanceForm)[] = [
        ...ALWAYS_REQUIRED,
      ];

      // UI fields -> only if enabled
      for (const f of UI_REQUIRED) {
        if (isEnabled(f as string)) required.push(f);
      }

      // Conditional voucher field
      if (triggerVoucherCreation && isEnabled("unitVoucherHeadById")) {
        required.push("unitVoucherHeadById");
      }

      return required;
    };

  const validate = () => {
    const req = getRequiredFields();
    const nextErrors: Record<string, string> = {};

    for (const field of req) {
      const value = formData?.[field];
      if (
        value === undefined ||
        value === null ||
        String(value).trim() === ""
      ) {
        // Human-friendly labels
        const labelMap: Record<string, string> = {
          date: "Date",
          requestorDeligation: "Requestor Delegation",
          officerName: "Name of Officer",
          rank: "Rank",
          contiss: "CONTISS",
          compNo: "COMP No",
          purpose: "Purpose of Advance",
          bank: "Bank",
          accountNumber: "Account number",
          outstandingBalance: "Outstanding balance yet to be retired",
          advanceAmount: "Amount of Advance Required",
          totalInWord: "Total in words",
          unitVoucherHeadById: "Head of Unit [Voucher]",
        };
        nextErrors[field as string] = `${
          labelMap[field as string] ?? field
        } is required.`;
      }
    }

    console.log("---------NEXT----------", nextErrors);

    setErrors(nextErrors);
    setHasErrors(Object.keys(nextErrors).length > 0);
    return nextErrors;
  };

  const handleSubmit = (status: string) => {
    const v = validate();
    if (Object.keys(v).length === 0) {
      setLoading(true);
      onSubmit(formData, status);
      setHasErrors(false);
    } else {
      // scroll to first error field if you want (optional)
      document
        .querySelector('[data-error="true"]')
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleCancel = () => {
    setFormData({
      date: moment(new Date()).format("YYYY-MM-DD"),
      requestorDeligation: getFinanceCode(user),
    });
    setErrors({});
    setHasErrors(false);
    onCancel();
  };

  // utility to compute field classes (error-aware)
  const inputClass = (
    field: keyof RequestForPurchaseOrSpecialAdvanceForm,
    also = ""
  ) =>
    `w-full p-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
      errors[field as string] ? "border-red-500" : "border-gray-300"
    } ${also}`;

  return (
    <div>
      <div className="flex justify-end items-end ">
        <button
          className="px-2 py-1 bg-blue-900 text-white rounded"
          onClick={() =>
            downloadPdf(componentRef as RefObject<HTMLElement>, {
              fileName: "job-maintenance-requisition.pdf",
              orientation: "portrait",
              format: "a4",
              margin: 10,
              scale: 1,
              hideSelectors: ["[data-export-hide]"], // hide buttons during capture
              onBeforeCapture: () => {},
              onAfterCapture: () => {},
            })
          }
        >
          Download
        </button>
      </div>

      <div
        ref={componentRef}
        className="bg-white rounded-lg sm:p-2 w-full max-w-4xl"
      >
        <div className="flex gap-4 mb-4 sm:mb-0">
          <img src={spedLogo} alt="Company Logo" className="h-24" />
          <div>
            <h2 className="text-center text-xl sm:text-2xl font-bold text-gray-600">
              {user?.organization?.name}
            </h2>
            <h1 className="text-xl sm:text-2xl  text-center text-gray-500">
              Request for Purchase or Special Advance
            </h1>
          </div>
        </div>

        {hasErrors && (
          <div className="bg-red-50 p-4 rounded-lg mb-2">
            <p className="text-red-800 text-sm">
              There are some errors or missing required fields.
            </p>
          </div>
        )}

        <p className="mt-4"></p>
        <>
          {/* Name of Officer */}
          <div className="flex flex-col md:flex-row items-start md:items-center">
            <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
              <span className="text-sm ">Name of Officer:</span>
            </div>
            <div className="w-full">
              <input
                type="text"
                value={formData?.officerName ?? ""}
                disabled={!isEnabled("officerName")}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("officerName", e.target.value)
                }
                className={inputClass("officerName", "mt-1")}
                data-error={!!errors.officerName}
              />
              {errors.officerName && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.officerName}
                </p>
              )}
            </div>
          </div>

          {/* Rank / CONTISS / COMP No */}
          <div className="my-1 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-2">
            <div className="flex flex-col md:flex-row items-start md:items-center">
              <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                <span className="text-sm ">Rank:</span>
              </div>
              <div className="w-full">
                <input
                  type="text"
                  value={formData?.rank ?? ""}
                  disabled={!isEnabled("rank")}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("rank", e.target.value)
                  }
                  className={inputClass("rank")}
                  data-error={!!errors.rank}
                />
                {errors.rank && (
                  <p className="text-xs text-red-600 mt-1">{errors.rank}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center">
              <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                <span className="text-sm ">CONTISS</span>
              </div>
              <div className="w-full">
                <input
                  type="text"
                  value={formData?.contiss ?? ""}
                  disabled={!isEnabled("contiss")}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("contiss", e.target.value)
                  }
                  className={inputClass("contiss")}
                  data-error={!!errors.contiss}
                />
                {errors.contiss && (
                  <p className="text-xs text-red-600 mt-1">{errors.contiss}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center">
              <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                <span className="text-sm ">COMP No</span>
              </div>
              <div className="w-full">
                <input
                  type="text"
                  value={formData?.compNo ?? ""}
                  disabled={!isEnabled("compNo")}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("compNo", e.target.value)
                  }
                  className={inputClass("compNo")}
                  data-error={!!errors.compNo}
                />
                {errors.compNo && (
                  <p className="text-xs text-red-600 mt-1">{errors.compNo}</p>
                )}
              </div>
            </div>
          </div>

          {/* Purpose of Advance */}
          <div className="">
            <h3 className="text-sm text-gray-700">Purpose of Advance</h3>
            <div>
              <textarea
                name="purpose"
                id="purpose"
                value={formData?.purpose || ""}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  handleInputChange("purpose", e.target.value)
                }
                disabled={!isEnabled("purpose")}
                className={inputClass("purpose")}
                rows={3}
                data-error={!!errors.purpose}
              ></textarea>
              {errors.purpose && (
                <p className="text-xs text-red-600 mt-1">{errors.purpose}</p>
              )}
            </div>
          </div>

          {/* Bank / Account number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            <div className="flex flex-col md:flex-row items-start md:items-center">
              <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                <span className="text-sm ">Bank:</span>
              </div>
              <div className="w-full">
                <input
                  type="text"
                  value={formData?.bank ?? ""}
                  disabled={!isEnabled("bank")}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("bank", e.target.value)
                  }
                  className={inputClass("bank", "mt-1")}
                  data-error={!!errors.bank}
                />
                {errors.bank && (
                  <p className="text-xs text-red-600 mt-1">{errors.bank}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center">
              <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                <span className="text-sm ">Account number:</span>
              </div>
              <div className="w-full">
                <input
                  type="text"
                  value={formData?.accountNumber ?? ""}
                  disabled={!isEnabled("accountNumber")}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("accountNumber", e.target.value)
                  }
                  className={inputClass("accountNumber", "mt-1")}
                  data-error={!!errors.accountNumber}
                />
                {errors.accountNumber && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.accountNumber}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Outstanding Balance */}
          <div className=" my-1 flex flex-col md:flex-row items-start md:items-center">
            <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
              <span className="text-sm ">
                Outstanding Balance yet to be retired:
              </span>
            </div>
            <div className="w-full">
              <input
                type="text"
                value={formData?.outstandingBalance ?? ""}
                disabled={!isEnabled("outstandingBalance")}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("outstandingBalance", e.target.value)
                }
                className={inputClass("outstandingBalance")}
                data-error={!!errors.outstandingBalance}
              />
              {errors.outstandingBalance && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.outstandingBalance}
                </p>
              )}
            </div>
          </div>

          {/* Amount of Advance Required */}
          <div className="mb-0 md:mb-0 md:mr-2 min-w-max">
            <span className="text-sm ">Amount of Advance Required:</span>
          </div>
          <div className="w-full">
            <input
              type="text"
              value={formData?.advanceAmount ?? ""}
              disabled={!isEnabled("advanceAmount")}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleInputChange("advanceAmount", e.target.value)
              }
              className={inputClass("advanceAmount")}
              data-error={!!errors.advanceAmount}
            />
            {errors.advanceAmount && (
              <p className="text-xs text-red-600 mt-1">
                {errors.advanceAmount}
              </p>
            )}
          </div>

          {/* Total in words */}
          <div>
            <h3 className="text-l  text-gray-700 mb-1">Total in words:</h3>
            <div>
              <textarea
                name="totalInWord"
                id="totalInWord"
                value={formData?.totalInWord || ""}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  handleInputChange("totalInWord", e.target.value)
                }
                disabled={!isEnabled("totalInWord")}
                className={inputClass("totalInWord")}
                rows={2}
                data-error={!!errors.totalInWord}
              ></textarea>
              {errors.totalInWord && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.totalInWord}
                </p>
              )}
            </div>
          </div>

          {/* Attachments */}
          {showAddDocument && (
            <DocumentAttachmentForm
              onSubmit={(documents) =>
                setFormData((prev) => ({ ...prev, attachments: documents }))
              }
              mode="new"
              initialDocuments={formData?.attachments || []}
            />
          )}

          {/* Voucher Approval (conditional & required only when triggerVoucherCreation is true) */}
          {triggerVoucherCreation && (
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
                    onChange={(e) =>
                      handleInputChange("unitVoucherHeadById", e.target.value)
                    }
                    className={`mt-0 ${inputClass("unitVoucherHeadById")}`}
                    data-error={!!errors.unitVoucherHeadById}
                    disabled={!isEnabled("unitVoucherHeadById")}
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
              </div>
            </div>
          )}
        </>

        {/* Signers row */}
        {showApprovers && (
          <div className="mt-4 flex flex-wrap gap-6">
            {/* Requestor */}
            <div className="w-[340px] max-w-full flex-shrink-0">
              <Signer
                firstName={
                  formData?.requestor?.firstName || user?.firstName || ""
                }
                lastName={formData?.requestor?.lastName || user?.lastName || ""}
                date={
                  formData?.requestor?.date ||
                  moment(new Date()).format("DD/MM/YYYY")
                }
                department={
                  formData?.requestor?.department ||
                  user?.department?.name ||
                  ""
                }
                position={
                  formData?.requestor?.position || user?.position?.title || ""
                }
                label="Request"
              />
            </div>

            {/* Approvers */}
            {(formData?.approvers || []).map((approver, idx) => (
              <div key={idx} className="w-[340px] max-w-full flex-shrink-0">
                <Signer
                  firstName={approver.firstName}
                  lastName={approver.lastName}
                  department={approver.department}
                  position={approver.position}
                  label={approver.label}
                />
              </div>
            ))}
          </div>
        )}

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
    </div>
  );
};

export default RequestForPurchaseOrSpecialAdvance;
