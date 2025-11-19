import React, { useEffect, useRef, useState, type RefObject } from "react";
import { useOrganization } from "../../GlobalContexts/Organization-Context";
import { useAuth } from "../../GlobalContexts/AuthContext";
import moment from "moment";
import useDownloadPdf from "../../common/hooks/useDownloadPdf";
import { generateVoucherCode, getFinanceCode } from "../../common/methods";
import tetFundLogo from "../../assets/tetfundLogo.jpg";
import Signer from "../../components/Signer";
import FormActions from "./FormActions";
import { type VoteBookAccountLookup } from "../../vouchers/VoucherAccountLookup";
import type { PaymentVoucherDataType } from "./PaymentVoucher";
import DocumentAttachmentForm from "./DocumentAttachmentForm.tsx";
import type { WorkflowRequest } from "../../common/types.tsx";
import CentralPaymentOfficeApprovalAssignments from "./widgets/CentralPaymentOfficeApprovalAssginments.tsx";
import AuditUnitAssignments from "./widgets/AuditUnitAssignments.tsx";
import VoucherApprovalAssignment from "./widgets/VoucherApprovalAssignment.tsx";
import EntriDistribution from "./widgets/EntryDistribution.tsx";
import CertificationStatement from "./widgets/CertificationStatement.tsx";
import VoucherPaymentDetail from "./widgets/VoucherPaymentDetail.tsx";

export interface PaymentDetail {
  paymentDate: string;
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
  date: string;
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
export interface EmployeeOption {
  id: string | number;
  value: string | number;
  label: string;
}

export interface CompletedStage {
  step: string | number;
  updatedAt: string | Date;
  assignedTo: {
    firstName?: string;
    lastName?: string;
    department?: { name?: string };
    position?: { title?: string };
    [key: string]: any;
  };
}

interface Approver {
  bottomComment?: string;
  stepNumber: number;
}

interface PaymentVoucherTetfundProps {
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
  parentRequestId?: number;
  parentRequest?: WorkflowRequest;
}

const formatDate = (date: string | Date | undefined) =>
  date ? moment(date).format("DD-MM-YYYY") : "";

/** Human-friendly labels for errors */
const labelMap: Record<string, string> = {
  applicantName: "PAYEE",
  applicantAddress: "Payee Address",
  applicantDescription: "Payee Description",
  fileRefNo: "File Ref No",
  paymentDate: "Payment Date",
  paymentParticles: "Particulars (Including References)",
  paymentDetailAmount: "Amount",
  grossTotalBill: "Gross Total Bill",
  lessVat: "Less VAT",
  wht: "WHT",
  totalEstimate: "Net Amount Payable",
  amountInWord: "Total in words",

  accountTitle: "Account Title",
  accountCodeNo: "Account Code No.",
  debitAmount: "Debit Amount",
  debitDescription: "Debit Description",
  creditAmount: "Credit Amount",
  creditDescription: "Credit Description",

  unitVoucherHeadById: "Head of Unit [Voucher]",
  preparedById: "Prepared By",
  reviewedById: "Reviewed By",
  approvedById: "Approved By",

  cpoHeadById: "Head of Unit [CPO]",
  cpoPreparedById: "Payment Initiator",
  cpoReviewedById: "Payment Reviewer",
  cpoApprovedById: "Payment Approver",

  auditCheckedById: "Audit Checker",
  auditReviewedById: "Audit Reviewer",
  auditRemarkedById: "Audit Remarker",
  auditCheckedByDate: "Audit Checked Date",
  auditReviewedByDate: "Audit Reviewed Date",
  auditApprovedByDate: "Audit Remarked Date",
  auditRemarkPass: "Audit Remark (Pass)",
  auditRemarkQuery: "Audit Remark (Query)",
};

export const calculatePaymentDetail = (
  formData: PaymentVoucherDataType,
  grossTotalBill: string
) => {
  const stampDutyPercent = 1;

  const vatPercent = 7.5;

  const stampDuty = ((Number(grossTotalBill) * stampDutyPercent) / 100).toFixed(
    2
  );

  const lessStampDuty = Number(grossTotalBill) - Number(stampDuty);

  const vat = ((Number(lessStampDuty) * vatPercent) / 107.5).toFixed(2);

  const lessVat = lessStampDuty - Number(vat);

  const wht = ((Number(formData.whtPercent) * Number(lessVat)) / 100).toFixed(
    2
  );

  const totalEstimate = (
    Number(grossTotalBill) -
    Number(stampDuty) -
    Number(vat) -
    Number(wht)
  ).toFixed(2);

  return {
    grossTotalBill,
    lessVat,
    vat,
    stampDuty,
    wht,
    lessStampDuty,
    stampDutyPercent,
    vatPercent,
    totalEstimate,
  };
};

const PaymentVoucherTetfund: React.FC<PaymentVoucherTetfundProps> = ({
  formResponses,
  enableInputList = [""],
  vissibleSections = [],
  instruction = "",
  onSubmit,
  onCancel,
  showActionButtons = false,
  mode = "new",
  completedStages = [],
  responseTypes = [""],
  loading = false,
  setLoading,
}) => {
  console.log("---enableInputList-----", enableInputList);

  const componentRef = useRef<HTMLDivElement>(null);
  const downloadPdf = useDownloadPdf();
  const { user } = useAuth();
  const {
    userDepartmenttMembers,
    fetchDepartmentEmployees,
    departmentEmployeeFilter,
  } = useOrganization();

  const employeeOptions: EmployeeOption[] =
    userDepartmenttMembers?.rows?.map((employee: any) => ({
      id: employee.id,
      value: employee.id,
      label: `${employee.firstName} - ${employee.lastName}`,
    })) ?? [];

  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasErrors, setHasErrors] = useState<boolean>(false);
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

  const isEnabled = (name: string) => enableInputList.includes(name);
  const isVisible = (section: string) =>
    mode === "preview" || (vissibleSections || []).includes(section);

  /** unified change handler + error clearing */
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
  }, [formData.whtPercent]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, ...formResponses }));
  }, [formResponses]);

  useEffect(() => {
    fetchDepartmentEmployees(departmentEmployeeFilter);
  }, []);

  /** Build the set of required fields based on enabled inputs + visible sections. */
  const getRequiredFields = () => {
    const req = new Set<string>();
    const addIfEnabled = (f: string) => {
      if (isEnabled(f)) req.add(f);
    };

    // Applicant Information
    if (isVisible("applicantInformation")) {
      ["applicantName", "fileRefNo"].forEach(addIfEnabled);
    }

    // Payment Voucher Details
    if (isVisible("paymentDetails")) {
      [
        "paymentParticles",
        "paymentDetailAmount",
        "grossTotalBill",
        "lessVat",
        "wht",
        "totalEstimate",
        "amountInWord",
        "stampDuty",
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

    // ✅ Voucher Approval — ALWAYS required when section visible
    if (isVisible("voucherApproval")) {
      [
        "unitVoucherHeadById",
        "preparedById",
        "reviewedById",
        "approvedById",
      ].forEach(addIfEnabled);
    }

    // Audit Unit (when visible)
    if (isVisible("auditApproval")) {
      ["auditCheckedById", "auditReviewedById", "auditRemarkedById"].forEach(
        addIfEnabled
      );
    }

    // CPO Approval (when visible)
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

  const validate = () => {
    const required = getRequiredFields();
    const next: Record<string, string> = {};

    for (const f of required) {
      const v = (formData as any)?.[f];
      if (v === undefined || v === null || String(v).trim() === "") {
        next[f] = `${labelMap[f] ?? f} is required.`;
      }
    }

    // Optional: basic numeric checks for amounts if present & enabled
    const numericFields = [
      "paymentDetailAmount",
      "grossTotalBill",
      "lessVat",
      "wht",
      "totalEstimate",
      "debitAmount",
      "creditAmount",
    ];
    for (const nf of numericFields) {
      if (isEnabled(nf) && (formData as any)?.[nf] !== undefined) {
        const val = String((formData as any)[nf]).trim();
        if (val && isNaN(Number(val))) {
          next[nf] = `${labelMap[nf] ?? nf} must be a number.`;
        }
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
    setFormData({} as PaymentVoucherDataType);
    setErrors({});
    setHasErrors(false);
    onCancel();
  };

  const getSignerProps = (approver: Approver) => {
    const completedStage = (completedStages || []).find(
      (comStage) => Number(comStage.step) === approver.stepNumber
    );
    if (!completedStage) return undefined;
    const assignee = completedStage.assignedTo ?? {};
    return {
      firstName: assignee.firstName || "",
      lastName: assignee.lastName || "",
      date: completedStage?.updatedAt
        ? moment(completedStage?.updatedAt).format("DD/MM/YYYY")
        : "",
      department: assignee.department?.name || "",
      position: assignee?.position?.title || "",
      label: approver.bottomComment,
    };
  };

  const inputClass = (name: string, extra = "") =>
    `mt-0 w-full p-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
      errors[name] ? "border-red-500" : "border-gray-300"
    } ${extra}`;

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
              onBeforeCapture: () => setIsDownloading(true),
              onAfterCapture: () => setIsDownloading(false),
            })
          }
        >
          {isDownloading ? "Downloading..." : "Download"}
        </button>
      </div>

      <div
        ref={componentRef}
        className="bg-white rounded-lg sm:p-1 w-full max-w-4xl"
      >
        <div className="flex flex-col sm:flex-row items-start mt-2">
          <div className="mb-4 sm:mb-0">
            <img src={tetFundLogo} alt="Company Logo" className="h-15" />
          </div>
          <div>
            <h2 className="text-center text-4xl font-bold text-gray-600">
              TETFund Funded Projects
            </h2>
            <h1 className="text-xl sm:text-2xl font-semibold text-center text-gray-500">
              Payment Voucher
            </h1>
          </div>
        </div>
        <p className="my-4 font-semibold text-center text-gray-500">
          NAME OF INSTITUTION: {user?.organization?.name}
        </p>

        {hasErrors && (
          <div className="bg-red-50 p-4 rounded-lg mb-2">
            <p className="text-red-800 text-sm">
              There are some errors or missing required fields.
            </p>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-end items-start mt-2">
          <div className="text-left">
            <p className="text-sm font-semibold">
              Payment Voucher No:{" "}
              <span className="font-normal">{formData?.voucherNo}</span>
            </p>
            <p className="text-sm font-semibold">
              Serial No:{" "}
              <span className="font-normal">{formData?.financeCode}</span>
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
                  PAYEE
                </label>
                <input
                  name="applicantName"
                  id="applicantName"
                  value={formData?.applicantName || ""}
                  onChange={handleInput}
                  type="text"
                  disabled={!isEnabled("applicantName")}
                  className={inputClass("applicantName")}
                  placeholder=""
                />
                {errors.applicantName && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.applicantName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  File Ref No:
                </label>
                <input
                  name="fileRefNo"
                  id="fileRefNo"
                  value={formData?.fileRefNo || ""}
                  onChange={handleInput}
                  type="text"
                  disabled={!isEnabled("fileRefNo")}
                  className={inputClass("fileRefNo")}
                  placeholder=""
                />
                {errors.fileRefNo && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.fileRefNo}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <DocumentAttachmentForm
          onSubmit={(documents) =>
            setFormData((prev) => ({ ...prev, attachments: documents }))
          }
          mode={mode}
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

        {/* Certification Statement */}
        <CertificationStatement />

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

        {/* Voucher Approval (visible by section; required only when triggerVoucherCreation) */}
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
                value={formData?.additionalNotes || ""}
                onChange={handleInput}
                disabled={!isEnabled("additionalNotes")}
                className={inputClass("additionalNotes")}
                rows={4}
                placeholder="Enter Additional Notes or Comments"
              ></textarea>
              {errors.additionalNotes && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.additionalNotes}
                </p>
              )}
            </div>
          </div>
        )}

        {(vissibleSections?.includes("approvals") || mode === "preview") && (
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
              {formResponses?.approvers?.map((approver, idx) => (
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

export default PaymentVoucherTetfund;
