import React, { useEffect, useRef, useState, type RefObject } from "react";
import { useOrganization } from "../../GlobalContexts/Organization-Context";
import { useAuth } from "../../GlobalContexts/AuthContext";
import moment from "moment";
import useDownloadPdf from "../../common/hooks/useDownloadPdf";
import { generateVoucherCode, getFinanceCode } from "../../common/methods";
import spedLogo from "../../assets/spedLogo.png";
import Signer from "../../components/Signer";
import FormActions from "./FormActions";
import VoucherAccountLookup, {
  type VoteBookAccountLookup,
} from "../../vouchers/VoucherAccountLookup";

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

export interface PaymentVoucherDataType {
  voucherNo: string;
  departmentCode: string;
  applicationDate: string;
  // Flatten fields for controlled form
  financeCode?: string;
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
  unitVoucherHeadById?: string;
  preparedById?: string;
  reviewedById?: string;
  approvedById?: string;
  auditRemarkPass?: string;
  auditRemarkQuery?: string;
  auditCheckedById?: string;
  auditCheckedByDate?: string;
  auditReviewedById?: string;
  auditReviewedByDate?: string;
  auditRemarkedById?: string;
  auditApprovedByDate?: string;
  cpoHeadById?: string;
  cpoPreparedById?: string;
  cpoReviewedById?: string;
  cpoApprovedById?: string;
  additionalNotes?: string;
  [key: string]: any;
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

interface PaymentVoucherSemiAutoProps {
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
  mode?: "edit" | "preview" | "new" | "in_progress";
  responseTypes: string[];
  completedStages?: CompletedStage[];
}

const formatDate = (date: string | Date | undefined) =>
  date ? moment(date).format("DD-MM-YYYY") : "";

const requiredFields = [
  "applicantName",
  "applicantAddress",
  "applicantDescription",
  "paymentDate",
  "paymentParticles",
  "paymentDetailAmount",
  "amountInWord",
  "accountTitle",
  "accountCodeNo",
  "debitAmount",
  "debitDescription",
  "creditAmount",
  "creditDescription",
  "unitVoucherHeadById",
  "preparedById",
  "reviewedById",
  "approvedById",
];

const PaymentVoucherSemiAuto: React.FC<PaymentVoucherSemiAutoProps> = ({
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
  const componentRef = useRef<HTMLDivElement>(null);
  const downloadPdf = useDownloadPdf();
  const { user } = useAuth();
  const { userDepartmenttMembers } = useOrganization();

  const employeeOptions: EmployeeOption[] =
    userDepartmenttMembers?.rows?.map((employee: any) => ({
      id: employee.id,
      value: employee.id,
      label: `${employee.firstName} - ${employee.lastName}`,
    })) ?? [];

  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [hasErrors, setHasErrors] = useState<boolean>(false);
  const [_selectedVoucherAccount, setSelectedVoucherAccount] =
    useState<VoteBookAccountLookup | null>(null);

  const [formData, setFormData] = useState<PaymentVoucherDataType>({
    voucherNo: formResponses?.voucherNo || generateVoucherCode(),
    departmentCode: formResponses?.departmentCode || "",
    applicationDate:
      (formResponses?.applicationDate as string) ||
      moment().format("YYYY-MM-DD"),
    financeCode: getFinanceCode(user),
    ...formResponses,
  });

  const handleInput = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const keys = name.split("_");
      if (keys.length > 1) {
        const [field, index] = keys;
        // Only support for paymentDetails if actually used in the form
        if (Array.isArray(prevData.paymentDetails)) {
          return {
            ...prevData,
            paymentDetails: prevData.paymentDetails.map(
              (detail: any, i: number) =>
                i === parseInt(index) ? { ...detail, [field]: value } : detail
            ),
          };
        }
      }
      return { ...prevData, [name]: value };
    });
  };

  useEffect(() => {
    setFormData((prev) => ({ ...prev, ...formResponses }));
  }, [formResponses]);

  const isEnabled = (name: string) => enableInputList.includes(name);

  const checkIsValid = () => {
    const required: string[] = [];
    // Check top-level required fields
    for (let enableField of enableInputList) {
      if (requiredFields.includes(enableField) && !formData?.[enableField]) {
        required.push(enableField);
      }
    }
    return !!required.length;
  };

  const handleSubmit = (status: string) => {
    if (!checkIsValid()) {
      setLoading(true);
      onSubmit(formData, status);
      // setFormData({} as PaymentVoucherDataType);
      setHasErrors(false);
    } else {
      setHasErrors(true);
    }
  };

  const handleCancel = () => {
    setFormData({} as PaymentVoucherDataType);
    onCancel();
  };

  const approvers: Approver[] = [
    { bottomComment: "Approved By", stepNumber: 3 },
    { bottomComment: "Approved By", stepNumber: 11 },
  ];

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
        ref={componentRef}
        className="bg-white rounded-lg sm:p-1 w-full max-w-4xl"
      >
        <div className="flex flex-col sm:flex-row items-start mt-2">
          <div className="mb-4 sm:mb-0">
            <img src={spedLogo} alt="Company Logo" className="h-24" />
          </div>
          <div>
            <h2 className="text-center text-xl sm:text-2xl font-bold text-gray-600">
              {user?.organization?.name}
            </h2>
            <h1 className="text-xl sm:text-2xl font-semibold text-center text-gray-500">
              {vissibleSections?.includes("showFormTitle") || mode === "preview"
                ? "PAYMENT VOUCHER"
                : "FINANCIAL REQUEST"}
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

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-end items-start mt-2">
          <div className="text-left">
            <p className="text-sm font-semibold">
              Voucher No:{" "}
              <span className="font-normal">{formData?.voucherNo}</span>
            </p>
            <p className="text-sm font-semibold">
              Department Code:{" "}
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
        {(vissibleSections?.includes("applicantInformation") ||
          mode === "preview") && (
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
                  value={formData?.applicantName || ""}
                  onChange={handleInput}
                  type="text"
                  disabled={!isEnabled("applicantName")}
                  className={`mt-0 w-full p-1 border ${
                    isEnabled("applicantName")
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder=""
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Address
                </label>
                <input
                  name="applicantAddress"
                  id="applicantAddress"
                  value={formData?.applicantAddress || ""}
                  onChange={handleInput}
                  type="text"
                  disabled={!isEnabled("applicantAddress")}
                  className={`mt-0 w-full p-1 border ${
                    isEnabled("applicantAddress")
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder=""
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Request detail
                </label>
                <textarea
                  name="applicantDescription"
                  id="applicantDescription"
                  value={formData?.applicantDescription || ""}
                  onChange={handleInput}
                  disabled={!isEnabled("applicantDescription")}
                  className={`mt-0 w-full p-1 border ${
                    isEnabled("applicantDescription")
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  rows={2}
                  placeholder="Enter Description"
                ></textarea>
              </div>
            </div>
          </div>
        )}

        {/* Payment Detail */}
        {(vissibleSections?.includes("paymentDetails") ||
          mode === "preview") && (
          <div className="mt-2">
            <div className="flex w-full justify-between items-center">
              <h3 className="text-l font-semibold text-gray-700  mb-1">
                Payment Details
              </h3>
            </div>
            <div className="p-1 border rounded-lg border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-1 mb-4 ">
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Date
                  </label>
                  <input
                    name={`paymentDate`}
                    id={`paymentDate`}
                    value={formData?.paymentDate || ""}
                    onChange={handleInput}
                    type="date"
                    disabled={!isEnabled(`paymentDate`)}
                    className={`mt-0 w-full p-1 border ${
                      isEnabled(`paymentDate`)
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Enter Amount"
                  />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-600">
                    Particlars (Including References)
                  </label>
                  <textarea
                    name={`paymentParticles`}
                    id={`paymentParticles`}
                    value={formData?.paymentParticles || ""}
                    onChange={handleInput}
                    disabled={!isEnabled(`paymentParticles`)}
                    className={`mt-0 w-full p-1 border ${
                      isEnabled(`paymentParticles`)
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    rows={2}
                    placeholder="Enter Payment Description"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Amount
                  </label>
                  <input
                    name={`paymentDetailAmount`}
                    id={`paymentDetailAmount`}
                    value={formData?.paymentDetailAmount || ""}
                    onChange={handleInput}
                    type="text"
                    disabled={!isEnabled(`paymentDetailAmount`)}
                    className={`mt-0 w-full p-1 border ${
                      isEnabled(`paymentDetailAmount`)
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Enter Amount"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Amount in words
                </label>
                <input
                  name="amountInWord"
                  id="amountInWord"
                  value={formData?.amountInWord || ""}
                  onChange={handleInput}
                  disabled={!isEnabled("amountInWord")}
                  className={`mt-0 w-full p-1 border ${
                    isEnabled("amountInWord")
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  type="text"
                  placeholder=""
                />
              </div>
            </div>
          </div>
        )}

        {/* Entry Distribution */}
        {(vissibleSections?.includes("entryDistribution") ||
          mode === "preview") && (
          <div className="mt-2">
            <div className="flex w-full justify-between items-center">
              <h3 className="text-l font-semibold text-gray-700  mb-1">
                Entry Distribution
              </h3>
            </div>
            <div className="p-1 border rounded-lg border-gray-200">
              <div className="">
                <div className="flex flex-col sm:flex-row w-full gap-1">
                  <VoucherAccountLookup
                    isEnabled={
                      isEnabled("accountTitle") && isEnabled("accountCodeNo")
                    }
                    onSelect={(selected) => {
                      console.log("===========", selected);
                      if (selected !== null)
                        setSelectedVoucherAccount(selected);
                      setFormData((prev) => ({
                        ...prev,
                        selectedVoucherAccount: selected,
                        accountTitle: selected?.name,
                        accountCodeNo: selected?.code,
                      }));
                    }}
                    selectedAccount={formData.selectedVoucherAccount}
                  />
                </div>

                <div className="col-span-2 mt-0">
                  <label className="block text-sm font-medium text-gray-600">
                    Amount
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-1 p-1 border border-gray-200">
                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-600">
                        Debit
                      </label>
                      <div className="flex gap-1">
                        <input
                          name="debitAmount"
                          id="debitAmount"
                          value={formData?.debitAmount || ""}
                          onChange={handleInput}
                          disabled={!isEnabled("debitAmount")}
                          className={`mt-0 w-full p-1 border ${
                            isEnabled("debitAmount")
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          type="number"
                          placeholder="Amount"
                        />
                        <input
                          name="debitDescription"
                          id="debitDescription"
                          value={formData?.debitDescription || ""}
                          onChange={handleInput}
                          disabled={!isEnabled("debitDescription")}
                          className={`mt-0 w-full p-1 border ${
                            isEnabled("debitDescription")
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          type="text"
                          placeholder="Description"
                        />
                      </div>
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-600">
                        Credit
                      </label>
                      <div className="flex gap-1">
                        <input
                          name="creditAmount"
                          id="creditAmount"
                          value={formData?.creditAmount || ""}
                          onChange={handleInput}
                          disabled={!isEnabled("creditAmount")}
                          className={`mt-0 w-full p-1 border ${
                            isEnabled("creditAmount")
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          type="number"
                          placeholder="Amount"
                        />
                        <input
                          name="creditDescription"
                          id="creditDescription"
                          value={formData?.creditDescription || ""}
                          onChange={handleInput}
                          disabled={!isEnabled("creditDescription")}
                          className={`mt-0 w-full p-1 border ${
                            isEnabled("creditDescription")
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          type="text"
                          placeholder="Description"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Voucher Approval */}
        {(vissibleSections?.includes("voucherApproval") ||
          mode === "preview") && (
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
                  value={formData?.unitVoucherHeadById || ""}
                  onChange={handleInput}
                  required
                  disabled={!isEnabled("unitVoucherHeadById")}
                  className={`mt-0 w-full p-1 border ${
                    isEnabled("unitVoucherHeadById")
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Select an option</option>
                  {employeeOptions?.map((employee) => (
                    <option key={employee.id} value={employee.value}>
                      {employee.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Prepared By
                  </label>
                  {getSignerProps({ stepNumber: 0 }) ? (
                    <div
                      className={`mt-0 w-full p-1 border border-gray-300 rounded-md`}
                    >
                      {getSignerProps({ stepNumber: 0 })?.firstName}{" "}
                      {getSignerProps({ stepNumber: 0 })?.lastName}
                    </div>
                  ) : (
                    <select
                      name="preparedById"
                      id="preparedById"
                      value={formData?.preparedById || ""}
                      onChange={handleInput}
                      required
                      disabled={!isEnabled("preparedById")}
                      className={`mt-0 w-full p-1 border ${
                        isEnabled("preparedById")
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="">Select an option</option>
                      {employeeOptions?.map((employee) => (
                        <option key={employee.id} value={employee.value}>
                          {employee.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Reviewed By
                  </label>
                  {getSignerProps({ stepNumber: 1 }) ? (
                    <div
                      className={`mt-0 w-full p-1 border border-gray-300 rounded-md`}
                    >
                      {getSignerProps({ stepNumber: 1 })?.firstName}{" "}
                      {getSignerProps({ stepNumber: 1 })?.lastName}
                    </div>
                  ) : (
                    <select
                      name="reviewedById"
                      id="reviewedById"
                      value={formData?.reviewedById || ""}
                      onChange={handleInput}
                      required
                      disabled={!isEnabled("reviewedById")}
                      className={`mt-0 w-full p-1 border ${
                        isEnabled("reviewedById")
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="">Select an option</option>
                      {employeeOptions?.map((employee) => (
                        <option key={employee.id} value={employee.value}>
                          {employee.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Approved By
                  </label>
                  {getSignerProps({ stepNumber: 2 }) ? (
                    <div
                      className={`mt-0 w-full p-1 border border-gray-300 rounded-md`}
                    >
                      {getSignerProps({ stepNumber: 2 })?.firstName}{" "}
                      {getSignerProps({ stepNumber: 2 })?.lastName}
                    </div>
                  ) : (
                    <select
                      name="approvedById"
                      id="approvedById"
                      value={formData?.approvedById || ""}
                      onChange={handleInput}
                      required
                      disabled={!isEnabled("approvedById")}
                      className={`mt-0 w-full p-1 border ${
                        isEnabled("approvedById")
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="">Select an option</option>
                      {employeeOptions?.map((employee) => (
                        <option key={employee.id} value={employee.value}>
                          {employee.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Audit Unit */}
        {(vissibleSections?.includes("auditApproval") ||
          mode === "preview") && (
          <div className="mt-2 ">
            <h3 className="text-l font-semibold text-gray-700 mb-1">
              Audit Unit
            </h3>
            <div className="flex flex-col sm:flex-row p-1 border rounded-lg border-gray-200 gap-1">
              <div className="flex-1">
                <div className="mt-1">
                  <label className="block text-sm font-medium text-gray-600">
                    Pass
                  </label>
                  <div>
                    <textarea
                      name="auditRemarkPass"
                      id="auditRemarkPass"
                      value={formData?.auditRemarkPass || ""}
                      onChange={handleInput}
                      disabled={!isEnabled("auditRemarkPass")}
                      className={`mt-0 w-full p-1 border ${
                        isEnabled("auditRemarkPass")
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      rows={2}
                      placeholder="Enter Additional Notes or Comments"
                    ></textarea>
                  </div>
                </div>
                <div className="mt-1">
                  <label className="block text-sm font-medium text-gray-600">
                    Query
                  </label>
                  <div>
                    <textarea
                      name="auditRemarkQuery"
                      id="auditRemarkQuery"
                      value={formData?.auditRemarkQuery || ""}
                      onChange={handleInput}
                      disabled={!isEnabled("auditRemarkQuery")}
                      className={`mt-0 w-full p-1 border ${
                        isEnabled("auditRemarkQuery")
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      rows={2}
                      placeholder="Enter Additional Notes or Comments"
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="flex-1 ">
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Audit Checker:
                  </label>
                  <div className="flex gap-1">
                    {getSignerProps({ stepNumber: 4 }) ? (
                      <div
                        className={`mt-0 w-full p-1 border border-gray-300 rounded-md`}
                      >
                        {getSignerProps({ stepNumber: 4 })?.firstName}{" "}
                        {getSignerProps({ stepNumber: 4 })?.lastName}
                      </div>
                    ) : (
                      <select
                        name="auditCheckedById"
                        id="auditCheckedById"
                        value={formData?.auditCheckedById || ""}
                        onChange={handleInput}
                        required
                        disabled={!isEnabled("auditCheckedById")}
                        className={`mt-0 w-full p-1 border ${
                          isEnabled("auditCheckedById")
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="">Select an option</option>
                        {employeeOptions?.map((employee) => (
                          <option key={employee.id} value={employee.value}>
                            {employee.label}
                          </option>
                        ))}
                      </select>
                    )}
                    <input
                      name="auditCheckedByDate"
                      id="auditCheckedByDate"
                      value={formData?.auditCheckedByDate || ""}
                      onChange={handleInput}
                      disabled={!isEnabled("auditCheckedByDate")}
                      className={`mt-0 w-full p-1 border ${
                        isEnabled("auditCheckedByDate")
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      type="date"
                      placeholder=""
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-600">
                    Audit Reviewer
                  </label>
                  <div className="flex gap-1">
                    {getSignerProps({ stepNumber: 5 }) ? (
                      <div
                        className={`mt-0 w-full p-1 border border-gray-300 rounded-md`}
                      >
                        {getSignerProps({ stepNumber: 5 })?.firstName}{" "}
                        {getSignerProps({ stepNumber: 5 })?.lastName}
                      </div>
                    ) : (
                      <select
                        name="auditReviewedById"
                        id="auditReviewedById"
                        value={formData?.auditReviewedById || ""}
                        onChange={handleInput}
                        required
                        disabled={!isEnabled("auditReviewedById")}
                        className={`mt-0 w-full p-1 border ${
                          isEnabled("auditReviewedById")
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="">Select an option</option>
                        {employeeOptions?.map((employee) => (
                          <option key={employee.id} value={employee.value}>
                            {employee.label}
                          </option>
                        ))}
                      </select>
                    )}
                    <input
                      name="auditReviewedByDate"
                      id="auditReviewedByDate"
                      value={formData?.auditReviewedByDate || ""}
                      onChange={handleInput}
                      disabled={!isEnabled("auditReviewedByDate")}
                      className={`mt-0 w-full p-1 border ${
                        isEnabled("auditReviewedByDate")
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      type="date"
                      placeholder=""
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-600">
                    Audit Remarker
                  </label>
                  <div className="flex gap-1">
                    {getSignerProps({ stepNumber: 6 }) ? (
                      <div
                        className={`mt-0 w-full p-1 border border-gray-300 rounded-md`}
                      >
                        {getSignerProps({ stepNumber: 6 })?.firstName}{" "}
                        {getSignerProps({ stepNumber: 6 })?.lastName}
                      </div>
                    ) : (
                      <select
                        name="auditRemarkedById"
                        id="auditRemarkedById"
                        value={formData?.auditRemarkedById || ""}
                        onChange={handleInput}
                        required
                        disabled={!isEnabled("auditRemarkedById")}
                        className={`mt-0 w-full p-1 border ${
                          isEnabled("auditRemarkedById")
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="">Select an option</option>
                        {employeeOptions?.map((employee) => (
                          <option key={employee.id} value={employee.value}>
                            {employee.label}
                          </option>
                        ))}
                      </select>
                    )}
                    <input
                      name="auditApprovedByDate"
                      id="auditApprovedByDate"
                      value={formData?.auditApprovedByDate || ""}
                      onChange={handleInput}
                      disabled={!isEnabled("auditApprovedByDate")}
                      className={`mt-0 w-full p-1 border ${
                        isEnabled("auditApprovedByDate")
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      type="date"
                      placeholder=""
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {isDownloading && <div className="mb-40"></div>}

        {/* Central Payment Office Approval */}
        {(vissibleSections?.includes("cpoApproval") || mode === "preview") && (
          <div className="mt-2 ">
            <h3 className="text-l font-semibold text-gray-700 mb-1">
              Central Payment Office Approval
            </h3>
            <div className="p-1 border rounded-lg border-gray-200">
              <div className="">
                <label className=" text-sm font-medium text-gray-600">
                  Head of Unit [CPO]
                </label>
                {getSignerProps({ stepNumber: 7 }) ? (
                  <div
                    className={`mt-0 w-full p-1 border border-gray-300 rounded-md`}
                  >
                    {getSignerProps({ stepNumber: 7 })?.firstName}{" "}
                    {getSignerProps({ stepNumber: 7 })?.lastName}
                  </div>
                ) : (
                  <select
                    name="cpoHeadById"
                    id="cpoHeadById"
                    value={formData?.cpoHeadById || ""}
                    onChange={handleInput}
                    required
                    disabled={!isEnabled("cpoHeadById")}
                    className={`mt-0 w-full p-1 border ${
                      isEnabled("cpoHeadById")
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Select an option</option>
                    {employeeOptions?.map((employee) => (
                      <option key={employee.id} value={employee.value}>
                        {employee.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1  mt-1">
                {[
                  {
                    name: "cpoPreparedById",
                    label: "Payment Initiator",
                    stepNumber: 8,
                  },
                  {
                    name: "cpoReviewedById",
                    label: "Payment Reviewer",
                    stepNumber: 9,
                  },
                  {
                    name: "cpoApprovedById",
                    label: "Payment Approver",
                    stepNumber: 10,
                  },
                ].map((role) => (
                  <div key={role.name}>
                    <label className="block text-sm font-medium text-gray-600">
                      {role.label}
                    </label>
                    {getSignerProps({ stepNumber: role.stepNumber }) ? (
                      <div
                        className={`mt-0 w-full p-1 border border-gray-300 rounded-md`}
                      >
                        {
                          getSignerProps({ stepNumber: role.stepNumber })
                            ?.firstName
                        }{" "}
                        {
                          getSignerProps({ stepNumber: role.stepNumber })
                            ?.lastName
                        }
                      </div>
                    ) : (
                      <select
                        name={role.name}
                        id={role.name}
                        value={(formData as any)?.[role.name] || ""}
                        onChange={handleInput}
                        required
                        disabled={!isEnabled(role.name)}
                        className={`mt-0 w-full p-1 border ${
                          isEnabled(role.name)
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="">Select an option</option>
                        {employeeOptions?.map((employee) => (
                          <option key={employee.id} value={employee.value}>
                            {employee.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {(vissibleSections?.includes("additionalInformation") ||
          mode === "preview") && (
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
                className={`mt-0 w-full p-1 border ${
                  isEnabled("additionalNotes")
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                rows={4}
                placeholder="Enter Additional Notes or Comments"
              ></textarea>
            </div>
          </div>
        )}

        {(vissibleSections.includes("approvals") || mode === "preview") && (
          <div className="mt-2 ">
            <h3 className="text-l font-semibold text-gray-700 mb-1">
              Approvals
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {approvers.map((approver, idx) => (
                <Signer key={idx} {...(getSignerProps(approver) ?? {})} />
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

export default PaymentVoucherSemiAuto;
