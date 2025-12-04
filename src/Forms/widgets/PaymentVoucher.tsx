import React, { useEffect, useRef, useState, type RefObject } from "react";
import { useOrganization } from "../../GlobalContexts/Organization-Context";
import { useAuth } from "../../GlobalContexts/AuthContext";
import moment from "moment";
import useDownloadPdf from "../../common/hooks/useDownloadPdf";
import { generateVoucherCode } from "../../common/methods";
import spedLogo from "../../assets/spedLogo.png";
import Signer from "../../components/Signer";
import FormActions from "./FormActions";
import { type VoteBookAccountLookup } from "../../vouchers/VoucherAccountLookup";
import DocumentAttachmentForm from "./DocumentAttachmentForm";
import type { Approver } from "./ClaimOutOfPocketExpenses";
import type { WorkflowRequest } from "../../common/types";
import FinancialCodeModal, { getFinanceCode } from "./FinancialCodeModal";
import CentralPaymentOfficeApprovalAssignments from "./widgets/CentralPaymentOfficeApprovalAssginments";
import AuditUnitAssignments from "./widgets/AuditUnitAssignments";
import VoucherApprovalAssignment from "./widgets/VoucherApprovalAssignment";
import EntriDistribution from "./widgets/EntryDistribution";
import VoucherPaymentDetail from "./widgets/VoucherPaymentDetail";
import { calculatePaymentDetail } from "./PaymentVoucher-Tetfund";
import { isShowOrganizationDetail } from "../../common/constant";

/** Types copied from your snippet **/
export interface PaymentDetail {
  paymentDate: Date;
  paymentParticles: string;
  Amount: number;
}
export interface ApplicantDetail {
  applicantName: string;
  applicantAddress: string;
  applicantDescription: string;
}
export interface EntryDistribution {
  accountTitle: string;
  accountCodeNo: string;
  debitAmount: string;
  debitDescription: string;
  creditAmount: string;
  creditDescription: string;
}
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
export interface AuditUnitPersonnels {
  checkedBy: PersonnelType;
  preparedBy: PersonnelType;
  reviewedBy: PersonnelType;
  approvedBy: PersonnelType;
}
export interface AuditRemark {
  pass: string;
  query: string;
}

export interface PaymentVoucherDataType {
  voucherNo: string;
  departmentCode: string;
  applicationDate: Date | string;
  applicantName?: string;
  applicantAddress?: string;
  applicantDescription?: string;
  paymentDate?: string;
  paymentParticles?: string;
  paymentDetailAmount?: string;
  amountInWord?: string;
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
  approvers?: Approver[];
  [key: string]: any;
  applicantDetail?: ApplicantDetail;
  paymentDetails?: PaymentDetail[];
  entryDistribution?: EntryDistribution;
  voucherPersonnels?: VoucherPersonnels;
  auditUnitPersonnels?: AuditUnitPersonnels;
  auditRemark?: AuditRemark;
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

export interface PaymentVoucherProps {
  loading: boolean;
  setLoading: (value: boolean) => void;
  formResponses: Partial<PaymentVoucherDataType>;
  enableInputList?: string[];
  vissibleSections?: string[];
  showFormTitle?: boolean;
  showApplicationFormTitle?: boolean;
  instruction?: string;
  onSubmit: (data: PaymentVoucherDataType, status: string) => void;
  onCancel: () => void;
  showActionButtons?: boolean;
  mode?: "edit" | "preview" | "new" | "in_progress" | "view";
  responseTypes: string[];
  completedStages?: CompletedStage[];
  parentRequest?: WorkflowRequest;
  parentRequestId?: number;
}

const formatDate = (date: Date | string | undefined) =>
  date ? moment(date).format("DD-MM-YYYY") : "";

// ---- Component ----
const PaymentVoucher: React.FC<PaymentVoucherProps> = ({
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
  const downloadPdf = useDownloadPdf();
  const { user } = useAuth();
  const {
    userDepartmenttMembers,
    fetchDepartmentEmployees,
    departmentEmployeeFilter,
  } = useOrganization();

  const employeeOptions: EmployeeOption[] =
    (userDepartmenttMembers?.rows?.map((employee: any) => ({
      id: employee.id,
      value: employee.id,
      label: `${employee.firstName} - ${employee.lastName} `,
    })) as EmployeeOption[]) ?? [];

  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [hasErrors, setHasErrors] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [modalName, setMoadalName] = useState<string>("");
  const [selectedVoucherAccount, setSelectedVoucherAccount] =
    useState<VoteBookAccountLookup | null>(null);

  const [formData, setFormData] = useState<PaymentVoucherDataType>({
    voucherNo: formResponses?.voucherNo || generateVoucherCode(),
    departmentCode: formResponses?.departmentCode || "",
    applicationDate:
      (formResponses?.applicationDate as string) ||
      moment().format("YYYY-MM-DD"),
    financeCode: getFinanceCode(user),
    whtPercent: 5,
    ...formResponses,
  });

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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "grossTotalBill") {
      const paymentDetailCalculations = calculatePaymentDetail(formData, value);
      setFormData((prev) => ({
        ...prev,
        ...paymentDetailCalculations,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  useEffect(() => {
    if (formData.totalEstimate) {
      const paymentDetailCalculations = calculatePaymentDetail(
        formData,
        formData.grossTotalBill
      );
      setFormData((prev) => ({
        ...prev,
        ...paymentDetailCalculations,
      }));
    }
  }, [formData.whtPercent, formData.stampDutyPercent, formData.vatPercent]);

  useEffect(() => {
    fetchDepartmentEmployees(departmentEmployeeFilter);
  }, []);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, ...formResponses }));
    // eslint-disable-next-line
  }, [formResponses]);

  // ===== Validation =====
  const getRequiredFields = (): string[] => {
    const req = new Set<string>();
    const addIfEnabled = (f: string) => {
      if (isEnabled(f)) req.add(f);
    };

    // Applicant Information
    if (isVisible("applicantInformation")) {
      ["applicantName", "applicantAddress", "applicantDescription"].forEach(
        addIfEnabled
      );
    }

    // Payment Voucher Details
    if (isVisible("paymentDetails")) {
      [
        // "paymentDate",
        "paymentParticles",
        "paymentDetailAmount",
        "amountInWord",
      ].forEach(addIfEnabled);
    }

    // Entry Distribution
    if (isVisible("entryDistribution")) {
      [
        "accountTitle",
        "accountCodeNo",
        "debitAmount",
        "debitDescription",
        "creditAmount",
        "creditDescription",
      ].forEach(addIfEnabled);
    }

    // Voucher Approval — ALWAYS when section visible (no triggerVoucherCreation)
    if (isVisible("voucherApproval")) {
      [
        "unitVoucherHeadById",
        "preparedById",
        "reviewedById",
        "approvedById",
      ].forEach(addIfEnabled);
    }

    // Audit Unit (IDs only)
    if (isVisible("auditApproval")) {
      ["auditCheckedById", "auditReviewedById", "auditRemarkedById"].forEach(
        addIfEnabled
      );
    }

    // CPO Approval (IDs only)
    if (isVisible("cpoApproval")) {
      [
        "cpoHeadById",
        "cpoPreparedById",
        "cpoReviewedById",
        "cpoApprovedById",
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
    console.log("========203255.61=======", nextErrors);
    const hasErr = Object.keys(nextErrors).length > 0;
    setHasErrors(hasErr);

    if (!hasErr) {
      setLoading(true);
      onSubmit(
        { isVoucher: true, selectedVoucherAccount, ...formData },
        status
      );
    }
  };

  const handleCancel = () => {
    setFormData({} as PaymentVoucherDataType);
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
    <div className="">
      <div className="flex justify-end items-end ">
        <button
          className="px-2 py-1 bg-blue-900 text-white rounded"
          disabled={isDownloading}
          onClick={() =>
            downloadPdf(componentRef as RefObject<HTMLElement>, {
              fileName: "payment-voucher.pdf",
              orientation: "portrait",
              format: "a4",
              margin: 24,
              scale: 2,
              hideSelectors: ["[data-export-hide]"],
              onBeforeCapture: () => {
                setIsDownloading(true);
              },
              onAfterCapture: () => {
                setIsDownloading(false);
              },
            })
          }
        >
          {isDownloading ? "Downloading..." : "Download"}
        </button>
      </div>

      <div
        ref={componentRef as RefObject<HTMLDivElement>}
        className="bg-white rounded-lg sm:p-1 w-full max-w-4xl"
      >
        <div className="flex flex-col sm:flex-row items-start mt-2">
          <div className="mb-4 sm:mb-0">
            <img
              src={isShowOrganizationDetail ? spedLogo : "Logo"}
              alt="Company Logo"
              className="h-24"
            />
          </div>
          <div>
            <h2 className="text-center text-xl sm:text-2xl font-bold text-gray-600">
              {isShowOrganizationDetail
                ? user?.organization?.name
                : "Organization Name"}
            </h2>
            <h1 className="text-xl sm:text-2xl font-semibold text-center text-gray-500">
              PAYMENT VOUCHER
            </h1>
          </div>
        </div>

        {hasErrors && (
          <div className="bg-red-50 p-4 rounded-lg mb-2">
            <p className="text-red-800 text-sm">
              There are some errors or missing required fields
            </p>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-end items-start mt-2">
          <div className="text-left">
            <p className="text-sm font-semibold">
              Voucher No:{" "}
              <span className="font-normal">{formData?.voucherNo}</span>
            </p>
            <p className="text-sm font-semibold">
              Department Code: {formData?.financeCode}{" "}
              {mode === "new" && (
                <span
                  onClick={() => setMoadalName("FinancialCodeModal")}
                  className="font-normal text-blue-600 underline cursor-pointer"
                >
                  Add/Edit
                </span>
              )}
            </p>
            <p className="text-sm font-semibold">
              Date:{" "}
              <span className="font-normal">
                {formatDate(formData?.applicationDate)}
              </span>
            </p>
          </div>
        </div>

        {instruction && (
          <div className="bg-yellow-50 p-4 rounded-lg mb-2">
            <p className="text-yellow-800 text-sm">{instruction}</p>
          </div>
        )}

        {/* Applicant Information */}
        {isVisible("applicantInformation") && (
          <div className="border-gray-300 pt-4 mt-1">
            <h3 className="text-l font-semibold text-gray-700 mb-1">
              Applicant Information
            </h3>
            <div className="p-1 border rounded-lg border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Name
                </label>
                <input
                  name="applicantName"
                  id="applicantName"
                  value={formData?.applicantName ?? ""}
                  onChange={handleInput}
                  type="text"
                  disabled={!isEnabled("applicantName")}
                  className={inputClass("applicantName")}
                />
                {errors.applicantName && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.applicantName}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Address
                </label>
                <input
                  name="applicantAddress"
                  id="applicantAddress"
                  value={formData?.applicantAddress ?? ""}
                  onChange={handleInput}
                  type="text"
                  disabled={!isEnabled("applicantAddress")}
                  className={inputClass("applicantAddress")}
                />
                {errors.applicantAddress && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.applicantAddress}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Request detail
                </label>
                <textarea
                  name="applicantDescription"
                  id="applicantDescription"
                  value={formData?.applicantDescription ?? ""}
                  onChange={handleInput}
                  disabled={!isEnabled("applicantDescription")}
                  className={inputClass("applicantDescription")}
                  rows={2}
                  placeholder="Enter Description"
                />
                {errors.applicantDescription && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.applicantDescription}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <DocumentAttachmentForm
          mode={mode}
          onSubmit={(documents) =>
            setFormData((prev) => ({ ...prev, attachments: documents }))
          }
          initialDocuments={formData?.attachments || []}
        />

        {/* Payment Detail */}
        {isVisible("paymentDetails") && (
          <VoucherPaymentDetail
            formData={formData}
            errors={errors}
            isEnabled={isEnabled}
            inputClass={inputClass}
            handleInput={handleInput}
            setFormData={setFormData}
          />
        )}

        {/* Entry Distribution */}
        {isVisible("entryDistribution") && (
          <EntriDistribution
            formData={formData}
            errors={errors}
            isEnabled={isEnabled}
            inputClass={inputClass}
            handleInput={handleInput}
            selectedVoucherAccount={selectedVoucherAccount}
            setSelectedVoucherAccount={setSelectedVoucherAccount}
            setFormData={setFormData}
            setErrors={setErrors}
          />
        )}

        {/* Voucher Approval (no triggerVoucherCreation; required when visible) */}
        {isVisible("voucherApproval") && (
          <VoucherApprovalAssignment
            formData={formData}
            errors={errors}
            employeeOptions={employeeOptions}
            isEnabled={isEnabled}
            inputClass={inputClass}
            handleInput={handleInput}
            getSignerProps={getSignerProps}
          />
        )}

        {/* Audit Unit */}
        {isVisible("auditApproval") && (
          <AuditUnitAssignments
            formData={formData}
            errors={errors}
            employeeOptions={employeeOptions}
            isEnabled={isEnabled}
            inputClass={inputClass}
            handleInput={handleInput}
          />
        )}

        {isDownloading && <div className="mb-40"></div>}

        {/* Central Payment Office Approval */}
        {isVisible("cpoApproval") && (
          <CentralPaymentOfficeApprovalAssignments
            formData={formData}
            errors={errors}
            employeeOptions={employeeOptions}
            isEnabled={isEnabled}
            inputClass={inputClass}
            handleInput={handleInput}
          />
        )}

        {isVisible("additionalInformation") && (
          <div className="mt-2">
            <h3 className="text-l font-semibold text-gray-700 mb-1">
              Additional Notes
            </h3>
            <div>
              <textarea
                name="additionalNotes"
                id="additionalNotes"
                value={formData?.additionalNotes ?? ""}
                onChange={handleInput}
                disabled={!isEnabled("additionalNotes")}
                className={inputClass(
                  "additionalNotes",
                  "mt-0 w-full p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                )}
                rows={4}
                placeholder="Enter Additional Notes or Comments"
              />
            </div>
          </div>
        )}

        {isVisible("approvals") && (
          <div className="mt-2 ">
            <h3 className="text-l font-semibold text-gray-700 mb-1">
              Approvals
            </h3>
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
            <div className="mt-4 flex flex-wrap gap-6">
              {formResponses?.approvers?.map(
                (approver, idx: React.Key | null | undefined) => (
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
                )
              )}
            </div>
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
      {modalName === "FinancialCodeModal" && (
        <FinancialCodeModal
          isOpen={modalName === "FinancialCodeModal"}
          onClose={() => setMoadalName("")}
          onSelect={(code) =>
            setFormData((prev) => ({
              ...prev,
              financeCode: code,
            }))
          }
          selectedCode={formData?.financeCode || ""}
        />
      )}
    </div>
  );
};

export default PaymentVoucher;
