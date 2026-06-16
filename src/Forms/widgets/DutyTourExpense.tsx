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
import spedLogo from "../../resources/spedLogo.png";
import FormActions from "./FormActions";
import { useOrganization } from "../../GlobalContexts/Organization-Context";
import DocumentAttachmentForm from "./DocumentAttachmentForm";
import type { Approver } from "./ClaimOutOfPocketExpenses";
import type { EmployeeOption } from "./PaymentVoucher-Tetfund";
import { isShowOrganizationDetail } from "../../common/constant";

interface Requestor {
  firstName?: string;
  lastName?: string;
  date?: string;
  department?: string;
  position?: string;
  category?: string;
}

interface DutyTourExpenseForm {
  date: string;
  requestorDeligation?: string;

  officerName?: string;
  phone?: string;
  rank?: string;
  contedisConpcass?: string;

  purpose?: string;
  travelLocation?: string;
  startDate?: string;
  endDate?: string;
  travelMode?: string;

  estimatedTransportCost?: string;
  estimatedNight?: string;
  others?: string;
  totalEstimate?: string;

  totalInWord?: string;
  bank?: string;
  accountNumber?: string;

  amountApproveFigure?: string;
  amountApproveWord?: string;

  unitVoucherHeadById?: string;

  location?: string;
  description?: string;
  recommendationNotes?: string;
  requestor?: Requestor;
  approvers?: Approver[];
  attachments?: any[];

  [key: string]: any;
}

interface DutyTourExpenseProps {
  loading: boolean;
  setLoading: (value: boolean) => void;
  formResponses: Partial<DutyTourExpenseForm>;
  enableInputList?: string[];
  triggerVoucherCreation: boolean;
  vissibleSections?: string[];
  onSubmit: (data: DutyTourExpenseForm, status: string) => void;
  onCancel: () => void;
  showActionButtons?: boolean;
  mode?: "edit" | "preview" | "new" | "in_progress";
  responseTypes: string[];
  showApprovers?: boolean;
  showAddDocument?: boolean;
}

const ALWAYS_REQUIRED: (keyof DutyTourExpenseForm)[] = [
  "date",
  "requestorDeligation",
];

// All UI fields in this form become required when enabled/visible
const UI_REQUIRED: (keyof DutyTourExpenseForm)[] = [
  "officerName",
  "phone",
  "rank",
  "contedisConpcass",
  "purpose",
  "travelLocation",
  "startDate",
  "endDate",
  "travelMode",
  "estimatedTransportCost",
  "estimatedNight",
  "others",
  "totalEstimate",
  "totalInWord",
  "bank",
  "accountNumber",
  "amountApproveFigure",
  "amountApproveWord",
];

const labelMap: Record<string, string> = {
  date: "Date",
  requestorDeligation: "Requestor Delegation",
  officerName: "Name of Officer",
  phone: "Phone number",
  rank: "Rank",
  contedisConpcass: "CONTEDISS / CONPCASS",
  purpose: "Purpose of Tour",
  travelLocation: "Place(s) of travel",
  startDate: "Start date",
  endDate: "End date",
  travelMode: "Transport mode",
  estimatedTransportCost: "Estimated Transport Cost",
  estimatedNight: "Estimated Night Allowance",
  others: "Other(s) (If applicable) Specify",
  totalEstimate: "Total",
  totalInWord: "Total in words",
  bank: "Bank",
  accountNumber: "Account number",
  amountApproveFigure: "Approved amount (figure)",
  amountApproveWord: "Approved amount (word)",
  unitVoucherHeadById: "Head of Unit [Voucher]",
};

const DutyTourExpense: React.FC<DutyTourExpenseProps> = ({
  formResponses,
  enableInputList = [""],
  onSubmit,
  onCancel,
  showActionButtons = false,
  mode = "new",
  responseTypes = [""],
  triggerVoucherCreation,
  loading,
  setLoading,
  showApprovers = true,
  showAddDocument = true,
}) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const downloadPdf = useDownloadPdf();
  const { user } = useAuth();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasErrors, setHasErrors] = useState<boolean>(false);

  const [formData, setFormData] = useState<DutyTourExpenseForm>({
    date: moment(new Date()).format("YYYY-MM-DD"),
    requestorDeligation: getFinanceCode(user),
    ...formResponses,
  });

  const { userDepartmenttMembers } = useOrganization();
  const employeeOptions: EmployeeOption[] =
    (userDepartmenttMembers?.rows?.map((employee: any) => ({
      id: employee.id,
      value: employee.id,
      label: `${employee.firstName} - ${employee.lastName} `,
    })) as EmployeeOption[]) ?? [];

  const handleInputChange = (
    fieldId: keyof DutyTourExpenseForm,
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

  const getRequiredFields = (): (keyof DutyTourExpenseForm)[] => {
    const req: (keyof DutyTourExpenseForm)[] = [...ALWAYS_REQUIRED];
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
        next[f as string] = `${labelMap[f as string] ?? f} is required.`;
      }
    }

    // extra: if both dates are present, ensure end >= start (optional)
    if (
      !next.startDate &&
      !next.endDate &&
      formData.startDate &&
      formData.endDate
    ) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        next.endDate = "End date cannot be earlier than Start date.";
      }
    }

    setErrors(next);
    setHasErrors(Object.keys(next).length > 0);
    return next;
  };

  const handleSubmit = (status: string) => {
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

  const inputClass = (field: keyof DutyTourExpenseForm, extra = "") =>
    `w-full p-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${errors[field as string] ? "border-red-500" : "border-gray-300"
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
              onBeforeCapture: () => { },
              onAfterCapture: () => { },
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
          {isShowOrganizationDetail && (
            <img src={spedLogo} alt="Company Logo" className="h-24" />
          )}
          <div>
            <h2 className="text-center text-xl sm:text-2xl font-bold text-gray-600">
              {isShowOrganizationDetail
                ? user?.organization?.name
                : "Organization Name"}
            </h2>
            <h1 className="text-xl sm:text-2xl  text-center text-gray-500">
              Duty Tour Expense Form
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

        <p className="mt-4">PART A </p>
        <>
          <div className="">
            <div className="mb-1 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-4">
              {/* Officer name */}
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
              {/* Phone */}
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                  <span className="text-sm ">Phone number:</span>
                </div>
                <div className="w-full">
                  <input
                    type="text"
                    value={formData?.phone ?? ""}
                    disabled={!isEnabled("phone")}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("phone", e.target.value)
                    }
                    className={inputClass("phone", "mt-1")}
                    data-error={!!errors.phone}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-5">
                {/* Rank */}
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
                {/* CONTEDISS/CONPCASS */}
                <div className="flex flex-col md:flex-row items-start md:items-center">
                  <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                    <span className="text-sm ">
                      {mode === "new"
                        ? user?.category === "Teaching Staff"
                          ? "CONTEDISS"
                          : "CONPCASS"
                        : formData?.requestor?.category === "Teaching Staff"
                          ? "CONTEDISS"
                          : "CONPCASS"}
                    </span>
                  </div>
                  <div className="w-full">
                    <input
                      type="text"
                      value={formData?.contedisConpcass ?? ""}
                      disabled={!isEnabled("contedisConpcass")}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleInputChange("contedisConpcass", e.target.value)
                      }
                      className={inputClass("contedisConpcass")}
                      data-error={!!errors.contedisConpcass}
                    />
                    {errors.contedisConpcass && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.contedisConpcass}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Purpose */}
          <div className="">
            <h3 className="text-sm text-gray-700">Purpose of Tour</h3>
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

          {/* Travel location */}
          <div className=" flex flex-col md:flex-row items-start md:items-center">
            <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
              <span className="text-sm ">Place(s) of travel:</span>
            </div>
            <div className="w-full">
              <input
                type="text"
                value={formData?.travelLocation ?? ""}
                disabled={!isEnabled("travelLocation")}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("travelLocation", e.target.value)
                }
                className={inputClass("travelLocation")}
                data-error={!!errors.travelLocation}
              />
              {errors.travelLocation && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.travelLocation}
                </p>
              )}
            </div>
          </div>

          {/* Period of tour */}
          <div className=" my-1 flex flex-col md:flex-row items-start md:items-center">
            <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
              <span className="text-sm ">Period of Tour:</span>
            </div>
            <div className="flex gap-1 w-full">
              <input
                type="date"
                value={formData?.startDate ?? ""}
                disabled={!isEnabled("startDate")}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("startDate", e.target.value)
                }
                className={inputClass("startDate")}
                data-error={!!errors.startDate}
              />
              <span>To</span>
              <input
                type="date"
                value={formData?.endDate ?? ""}
                disabled={!isEnabled("endDate")}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("endDate", e.target.value)
                }
                className={inputClass("endDate")}
                data-error={!!errors.endDate}
              />
            </div>
            {(errors.startDate || errors.endDate) && (
              <p className="text-xs text-red-600 mt-1">
                {errors.startDate || errors.endDate}
              </p>
            )}
          </div>

          {/* Transport mode */}
          <div className=" flex flex-col md:flex-row items-start md:items-center">
            <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
              <span className="text-sm ">Tranport mode specify:</span>
            </div>
            <div className="w-full">
              <input
                type="text"
                value={formData?.travelMode ?? ""}
                disabled={!isEnabled("travelMode")}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("travelMode", e.target.value)
                }
                className={inputClass("travelMode")}
                placeholder="Road, Air, Sea, Rail"
                data-error={!!errors.travelMode}
              />
              {errors.travelMode && (
                <p className="text-xs text-red-600 mt-1">{errors.travelMode}</p>
              )}
            </div>
          </div>
        </>

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

        {/* PART B */}
        <p className="mt-4">PART B </p>
        <div className="border p-2 rounded border-gray-300">
          <div className=" grid grid-cols-2 gap-1">
            <div className="mb-0 md:mb-0 md:mr-2 min-w-max">
              <span className="text-sm ">Estimated Transport Cost:</span>
            </div>
            <div className="w-full">
              <input
                type="text"
                value={formData?.estimatedTransportCost ?? ""}
                disabled={!isEnabled("estimatedTransportCost")}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("estimatedTransportCost", e.target.value)
                }
                className={inputClass("estimatedTransportCost")}
                data-error={!!errors.estimatedTransportCost}
              />
              {errors.estimatedTransportCost && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.estimatedTransportCost}
                </p>
              )}
            </div>

            <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
              <span className="text-sm ">Estimated Night Allowance:</span>
            </div>
            <div className="w-full">
              <input
                type="text"
                value={formData?.estimatedNight ?? ""}
                disabled={!isEnabled("estimatedNight")}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("estimatedNight", e.target.value)
                }
                className={inputClass("estimatedNight")}
                placeholder="....Days X N......"
                data-error={!!errors.estimatedNight}
              />
              {errors.estimatedNight && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.estimatedNight}
                </p>
              )}
            </div>

            <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
              <span className="text-sm ">
                Other(s) (If Applicable) Specify:
              </span>
            </div>
            <div className="w-full">
              <input
                type="text"
                value={formData?.others ?? ""}
                disabled={!isEnabled("others")}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("others", e.target.value)
                }
                className={inputClass("others")}
                data-error={!!errors.others}
              />
              {errors.others && (
                <p className="text-xs text-red-600 mt-1">{errors.others}</p>
              )}
            </div>

            <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
              <span className="text-sm ">Total:</span>
            </div>
            <div className="w-full">
              <input
                type="text"
                value={formData?.totalEstimate ?? ""}
                disabled={!isEnabled("totalEstimate")}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("totalEstimate", e.target.value)
                }
                className={inputClass("totalEstimate")}
                data-error={!!errors.totalEstimate}
              />
              {errors.totalEstimate && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.totalEstimate}
                </p>
              )}
            </div>
          </div>

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
        </div>

        {/* PART C */}
        <p className="mt-4">PART C </p>
        <div className="border p-2 rounded border-gray-300">
          <h3 className="text-sm">Provost Approval for Expenditure </h3>
          <div>
            <div className="flex gap-2">
              <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                <span className="text-sm ">Sum of amount (in figure):</span>
              </div>
              <div className="w-full">
                <input
                  type="text"
                  value={formData?.amountApproveFigure ?? ""}
                  disabled={!isEnabled("amountApproveFigure")}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("amountApproveFigure", e.target.value)
                  }
                  className={inputClass("amountApproveFigure")}
                  data-error={!!errors.amountApproveFigure}
                />
                {errors.amountApproveFigure && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.amountApproveFigure}
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                <span className="text-sm ">Approved Amount (in word):</span>
              </div>
              <div className="w-full">
                <textarea
                  name="amountApproveWord"
                  id="amountApproveWord"
                  value={formData?.amountApproveWord || ""}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    handleInputChange("amountApproveWord", e.target.value)
                  }
                  disabled={!isEnabled("amountApproveWord")}
                  className={inputClass("amountApproveWord")}
                  rows={2}
                  data-error={!!errors.amountApproveWord}
                ></textarea>
                {errors.amountApproveWord && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.amountApproveWord}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Voucher Approval — required only when triggerVoucherCreation is true */}
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
                  date={approver.date}
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

export default DutyTourExpense;
