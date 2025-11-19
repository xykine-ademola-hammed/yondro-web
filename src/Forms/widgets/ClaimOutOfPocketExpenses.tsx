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
import Signer, { type LabelKey } from "../../components/Signer";
import { getFinanceCode } from "../../common/methods";
import spedLogo from "../../assets/spedLogo.png";
import FormActions from "./FormActions";
import { useOrganization } from "../../GlobalContexts/Organization-Context";
import DocumentAttachmentForm from "./DocumentAttachmentForm";
import type { EmployeeOption } from "./PaymentVoucher-Tetfund";

interface Requestor {
  firstName?: string;
  lastName?: string;
  date?: string;
  department?: string;
  position?: string;
}

export interface Approver {
  firstName: string;
  lastName: string;
  date?: string;
  department?: string;
  position?: string;
  label?: LabelKey;
  stepNumber?: number;
}

interface ClaimOutOfPocketExpenseForm {
  date: string;
  requestorDeligation?: string;

  officerName?: string; // From:
  department?: string;
  amount?: string;
  amountInWord?: string;
  purpose?: string;
  noReceiptAttestation?: string;
  bank?: string;
  accountNumber?: string;

  unitVoucherHeadById?: string; // conditional

  location?: string;
  description?: string;
  recommendationNotes?: string;
  requestor?: Requestor;
  approvers?: Approver[];
  attachments?: any[];

  [key: string]: any;
}

interface ClaimOutOfPocketExpenseProps {
  loading: boolean;
  setLoading: (value: boolean) => void;
  formResponses: Partial<ClaimOutOfPocketExpenseForm>;
  triggerVoucherCreation: boolean;
  enableInputList?: string[];
  vissibleSections?: string[];
  onSubmit: (data: ClaimOutOfPocketExpenseForm, status: string) => void;
  onCancel: () => void;
  showActionButtons?: boolean;
  mode?: "edit" | "preview" | "new" | "in_progress";
  responseTypes: string[];
  showApprovers?: boolean;
  showAddDocument?: boolean;
}

const ALWAYS_REQUIRED: (keyof ClaimOutOfPocketExpenseForm)[] = [
  "date",
  "requestorDeligation",
];

const UI_REQUIRED: (keyof ClaimOutOfPocketExpenseForm)[] = [
  "officerName",
  "department",
  "amount",
  "amountInWord",
  "purpose",
  // "noReceiptAttestation",
  "bank",
  "accountNumber",
];

const humanLabel: Record<string, string> = {
  date: "Date",
  requestorDeligation: "Requestor Delegation",
  officerName: "From",
  department: "Department",
  amount: "Amount",
  amountInWord: "Amount in word",
  purpose: "Purpose",
  noReceiptAttestation:
    "No-receipt attestation (full name if receipts are not available)",
  bank: "Bank",
  accountNumber: "Account number",
  unitVoucherHeadById: "Head of Unit [Voucher]",
};

const ClaimOutOfPocketExpense: React.FC<ClaimOutOfPocketExpenseProps> = ({
  formResponses,
  triggerVoucherCreation,
  enableInputList = [""],
  onSubmit,
  onCancel,
  showActionButtons = false,
  mode = "new",
  responseTypes = [""],
  loading,
  setLoading,
  showApprovers = true,
  showAddDocument = true,
}) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const downloadPdf = useDownloadPdf();
  const { user } = useAuth();

  const { userDepartmenttMembers } = useOrganization();
  const employeeOptions: EmployeeOption[] =
    (userDepartmenttMembers?.rows?.map((employee: any) => ({
      id: employee.id,
      value: employee.id,
      label: `${employee.firstName} - ${employee.lastName} `,
    })) as EmployeeOption[]) ?? [];

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasErrors, setHasErrors] = useState<boolean>(false);

  const [formData, setFormData] = useState<ClaimOutOfPocketExpenseForm>({
    date: moment(new Date()).format("YYYY-MM-DD"),
    requestorDeligation: getFinanceCode(user),
    ...formResponses,
  });

  const handleInputChange = (
    fieldId: keyof ClaimOutOfPocketExpenseForm,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    setErrors((prev) => {
      if (!prev[fieldId as string]) return prev;
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

  const getRequiredFields = (): (keyof ClaimOutOfPocketExpenseForm)[] => {
    const req: (keyof ClaimOutOfPocketExpenseForm)[] = [...ALWAYS_REQUIRED];
    for (const f of UI_REQUIRED) if (isEnabled(f as string)) req.push(f);
    if (triggerVoucherCreation && isEnabled("unitVoucherHeadById")) {
      req.push("unitVoucherHeadById");
    }
    return req;
  };

  const validate = () => {
    const req = getRequiredFields();
    const next: Record<string, string> = {};
    for (const f of req) {
      const v = formData?.[f];
      if (v === undefined || v === null || String(v).trim() === "") {
        next[f as string] = `${humanLabel[f as string] ?? f} is required.`;
      }
    }
    setErrors(next);
    setHasErrors(Object.keys(next).length > 0);
    return next;
  };

  const handleSubmit = (status: string) => {
    if (status === "Reject") {
      onSubmit(formData, status);
      return;
    }
    const v = validate();
    if (Object.keys(v).length === 0) {
      setLoading(true);
      onSubmit(formData, status);
      setHasErrors(false);
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

  const inputClass = (field: keyof ClaimOutOfPocketExpenseForm, extra = "") =>
    `w-full p-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
      errors[field as string] ? "border-red-500" : "border-gray-300"
    } ${extra}`;

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
              hideSelectors: ["[data-export-hide]"],
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
              Claim Form for Out-of-Pocket Expenses
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

        <p className="mt-4"> </p>
        <>
          <div className="">
            <div className="mb-1 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-4">
              {/* From (officerName) */}
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                  <span className="text-sm ">From:</span>
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

              {/* Department */}
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                  <span className="text-sm ">Department:</span>
                </div>
                <div className="w-full">
                  <input
                    type="text"
                    value={formData?.department ?? ""}
                    disabled={!isEnabled("department")}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("department", e.target.value)
                    }
                    className={inputClass("department", "mt-1")}
                    data-error={!!errors.department}
                  />
                  {errors.department && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.department}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Amount */}
            <div className="mb-1 flex flex-col md:flex-row items-start md:items-center">
              <div className=" md:mb-0 md:mr-2 min-w-max">
                <span className="text-sm ">Amount:</span>
              </div>
              <div className="w-full">
                <input
                  type="text"
                  value={formData?.amount ?? ""}
                  disabled={!isEnabled("amount")}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("amount", e.target.value)
                  }
                  className={inputClass("amount")}
                  data-error={!!errors.amount}
                />
                {errors.amount && (
                  <p className="text-xs text-red-600 mt-1">{errors.amount}</p>
                )}
              </div>
            </div>

            {/* Amount in word */}
            <div className="flex flex-col md:flex-row items-start md:items-center">
              <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                <span className="text-sm ">Amount in word</span>
              </div>
              <div className="w-full">
                <input
                  type="text"
                  value={formData?.amountInWord ?? ""}
                  disabled={!isEnabled("amountInWord")}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("amountInWord", e.target.value)
                  }
                  className={inputClass("amountInWord")}
                  data-error={!!errors.amountInWord}
                />
                {errors.amountInWord && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.amountInWord}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Purpose */}
          <div className="">
            <h3 className="text-sm text-gray-700">Purpose as follows:</h3>
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

          {/* No receipt attestation */}
          <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
            <span className="text-sm ">
              If receipts are not available, the officer claiming the refund
              should sign by writing his/her fullname
            </span>
          </div>
          <div className="w-full">
            <input
              type="text"
              value={formData?.noReceiptAttestation ?? ""}
              disabled={!isEnabled("noReceiptAttestation")}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleInputChange("noReceiptAttestation", e.target.value)
              }
              className={inputClass("noReceiptAttestation")}
              data-error={!!errors.noReceiptAttestation}
            />
            {errors.noReceiptAttestation && (
              <p className="text-xs text-red-600 mt-1">
                {errors.noReceiptAttestation}
              </p>
            )}
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

          {showAddDocument && (
            <DocumentAttachmentForm
              onSubmit={(documents) =>
                setFormData((prev) => ({ ...prev, attachments: documents }))
              }
              mode="new"
              initialDocuments={formData?.attachments || []}
            />
          )}

          {/* Voucher Approval (only required when triggerVoucherCreation is true) */}
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
                    className={inputClass("unitVoucherHeadById")}
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

            {(formData?.approvers || []).map((approver, idx) => (
              <div key={idx} className="w-[340px] max-w-full flex-shrink-0">
                <Signer
                  firstName={approver.firstName}
                  lastName={approver.lastName}
                  date={approver.date}
                  department={approver.department}
                  position={approver.position}
                  label={approver?.label}
                />
              </div>
            ))}
          </div>
        )}

        {showActionButtons && Array.isArray(responseTypes) && (
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

export default ClaimOutOfPocketExpense;
