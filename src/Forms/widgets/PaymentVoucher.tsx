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
import useDownloadPdf from "../../common/hooks/useDownloadPdf";
import { generateVoucherCode, getFinanceCode } from "../../common/methods";
import spedLogo from "../../assets/spedLogo.png";
import Signer from "../../components/Signer";
import FormActions from "./FormActions";
import VoucherAccountLookup, {
  type VoteBookAccountLookup,
} from "../../vouchers/VoucherAccountLookup";
import ParentRequestPreview from "./ParentRequestPreview";
import ModalWrapper from "../../components/modal-wrapper";
import DocumentAttachmentForm from "./DocumentAttachmentForm";

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
  name: string | number; // previous: number, but probably a string name
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
  [key: string]: any;
  // legacy fields not used (to match spread/forms usage)
  applicantDetail?: ApplicantDetail;
  paymentDetails?: PaymentDetail[];
  entryDistribution?: EntryDistribution;
  voucherPersonnels?: VoucherPersonnels;
  auditUnitPersonnels?: AuditUnitPersonnels;
  auditRemark?: AuditRemark;
}

// Used for stages
type CompletedStage = {
  step: number | string;
  updatedAt: string | Date;
  assignedTo: {
    firstName: string;
    lastName: string;
    department?: { name: string };
    position?: { title: string };
    [key: string]: any;
  };
};

type EmployeeOption = {
  id: string | number;
  value: string | number;
  label: string;
};

/** Props **/
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
  mode?: "edit" | "preview" | "new" | "in_progress";
  responseTypes: string[];
  completedStages?: CompletedStage[];
  parentRequestId?: number;
}

const formatDate = (date: Date | string | undefined) =>
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
  parentRequestId,
}) => {
  const componentRef = useRef<HTMLElement>(null);
  const downloadPdf = useDownloadPdf();
  const { user } = useAuth();
  const { userDepartmenttMembers } = useOrganization();
  const [isApplicationFormOpen, openApplicationForm] = useState(false);

  // Type safety for employee options
  const employeeOptions: EmployeeOption[] =
    (userDepartmenttMembers?.rows?.map((employee: any) => ({
      id: employee.id,
      value: employee.id,
      label: `${employee.firstName} - ${employee.lastName} `,
    })) as EmployeeOption[]) ?? [];

  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [hasErrors, setHasErrors] = useState<boolean>(false);
  const [selectedVoucherAccount, setSelectedVoucherAccount] =
    useState<VoteBookAccountLookup | null>(null);

  // type-safe state
  const [formData, setFormData] = useState<PaymentVoucherDataType>({
    financeCode: getFinanceCode(user),
    voucherNo: generateVoucherCode(),
    ...formResponses,
    // fill in defaults if necessary!
    departmentCode: formResponses?.departmentCode || "",
    applicationDate: formResponses?.applicationDate || new Date(),
  });

  // input handler
  const handleInput = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const keys = name.split("_");
      if (
        keys.length > 1 &&
        prevData.paymentDetails &&
        Array.isArray(prevData.paymentDetails)
      ) {
        const [field, index] = keys;
        return {
          ...prevData,
          paymentDetails: prevData.paymentDetails.map((detail, i) =>
            i === parseInt(index) ? { ...detail, [field]: value } : detail
          ),
        };
      }
      // all controlled
      return { ...prevData, [name]: value };
    });
  };

  useEffect(() => {
    setFormData((prev) => ({ ...prev, ...formResponses }));
    // eslint-disable-next-line
  }, [formResponses]);

  const isEnabled = (name: string) => enableInputList.includes(name);

  // type-safe validation
  const checkIsValid = () => {
    const required: string[] = [];
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
      onSubmit(
        { isVoucher: true, selectedVoucherAccount, ...formData },
        status
      );
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
      department: assignee.department?.name,
      position: assignee?.position?.title,
      label: approver.bottomComment,
    };
  }
  // --- COMPONENT RENDER --- //
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

        {/* Header */}
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
                  value={formData?.applicantName ?? ""}
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
                  value={formData?.applicantAddress ?? ""}
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
                  value={formData?.applicantDescription ?? ""}
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

                {/* Instead Here we lookup at the application Request that inititate this form process.
                Then we can pull the response by navigating to the form response page, 
                if possible open in a new tab */}

                {parentRequestId && (
                  <button
                    onClick={() => openApplicationForm(true)}
                    rel="noopener noreferrer"
                    className="inline-flex my-1 items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-indigo-500 hover:to-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
                  >
                    View Application
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <DocumentAttachmentForm
          onSubmit={(documents) =>
            setFormData((prev) => ({ ...prev, attachments: documents }))
          }
          mode="new"
          initialDocuments={formData?.attachments || []}
        />

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
                    value={formData?.paymentDate ?? ""}
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
                    Particulars (Including References)
                  </label>
                  <textarea
                    name={`paymentParticles`}
                    id={`paymentParticles`}
                    value={formData?.paymentParticles ?? ""}
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
                    value={formData?.paymentDetailAmount ?? ""}
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
                  value={formData?.amountInWord ?? ""}
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
                          value={formData?.debitAmount ?? ""}
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
                          value={formData?.debitDescription ?? ""}
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
                          value={formData?.creditAmount ?? ""}
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
                          value={formData?.creditDescription ?? ""}
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
                  value={formData?.unitVoucherHeadById ?? ""}
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
                {/* <DepartmentMemberLookup
                  label="Head of Unit"
                  selectedUserId={formData?.unitVoucherHeadById }
                  onSelect={(member) => {
                  }}
                /> */}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                {/** Prepared, Reviewed, Approved By selects */}
                {[
                  { name: "preparedById", label: "Prepared By", stepNumber: 2 },
                  { name: "reviewedById", label: "Reviewed By", stepNumber: 3 },
                  { name: "approvedById", label: "Approved By", stepNumber: 4 },
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
                        value={(formData as any)?.[role.name] ?? ""}
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
                      value={formData?.auditRemarkPass ?? ""}
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
                      value={formData?.auditRemarkQuery ?? ""}
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
                    {getSignerProps({ stepNumber: 10 }) ? (
                      <div
                        className={`mt-0 w-full p-1 border border-gray-300 rounded-md`}
                      >
                        {getSignerProps({ stepNumber: 10 })?.firstName}{" "}
                        {getSignerProps({ stepNumber: 10 })?.lastName}
                      </div>
                    ) : (
                      <select
                        name="auditCheckedById"
                        id="auditCheckedById"
                        value={formData?.auditCheckedById ?? ""}
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
                      value={formData?.auditCheckedByDate ?? ""}
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
                    {getSignerProps({ stepNumber: 11 }) ? (
                      <div
                        className={`mt-0 w-full p-1 border border-gray-300 rounded-md`}
                      >
                        {getSignerProps({ stepNumber: 11 })?.firstName}{" "}
                        {getSignerProps({ stepNumber: 11 })?.lastName}
                      </div>
                    ) : (
                      <select
                        name="auditReviewedById"
                        id="auditReviewedById"
                        value={formData?.auditReviewedById ?? ""}
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
                      value={formData?.auditReviewedByDate ?? ""}
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
                    {getSignerProps({ stepNumber: 12 }) ? (
                      <div
                        className={`mt-0 w-full p-1 border border-gray-300 rounded-md`}
                      >
                        {getSignerProps({ stepNumber: 12 })?.firstName}{" "}
                        {getSignerProps({ stepNumber: 12 })?.lastName}
                      </div>
                    ) : (
                      <select
                        name="auditRemarkedById"
                        id="auditRemarkedById"
                        value={formData?.auditRemarkedById ?? ""}
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
                      value={formData?.auditApprovedByDate ?? ""}
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
                {getSignerProps({ stepNumber: 13 }) ? (
                  <div
                    className={`mt-0 w-full p-1 border border-gray-300 rounded-md`}
                  >
                    {getSignerProps({ stepNumber: 13 })?.firstName}{" "}
                    {getSignerProps({ stepNumber: 13 })?.lastName}
                  </div>
                ) : (
                  <select
                    name="cpoHeadById"
                    id="cpoHeadById"
                    value={formData?.cpoHeadById ?? ""}
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
                    stepNumber: 14,
                  },
                  {
                    name: "cpoReviewedById",
                    label: "Payment Reviewer",
                    stepNumber: 15,
                  },
                  {
                    name: "cpoApprovedById",
                    label: "Payment Approver",
                    stepNumber: 16,
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
                        value={(formData as any)?.[role.name] ?? ""}
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
                value={formData?.additionalNotes ?? ""}
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

        {(vissibleSections?.includes("approvals") || mode === "preview") && (
          <div className="mt-2 ">
            <h3 className="text-l font-semibold text-gray-700 mb-1">
              Approvals
            </h3>
            <div className="mt-4 flex flex-wrap gap-6">
              {formResponses?.approvers?.map(
                (
                  approver: {
                    firstName: string | undefined;
                    lastName: string | undefined;
                    date: string | undefined;
                    department: string | undefined;
                    position: string | undefined;
                    label: string | undefined;
                  },
                  idx: React.Key | null | undefined
                ) => (
                  <div key={idx} className="w-[340px] max-w-full flex-shrink-0">
                    <Signer
                      firstName={approver.firstName}
                      lastName={approver.lastName}
                      date={approver.date}
                      department={approver.department}
                      position={approver.position}
                      label={approver.label}
                    />{" "}
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

        {isApplicationFormOpen && (
          <ModalWrapper
            isOpen={isApplicationFormOpen}
            onClose={() => openApplicationForm(false)}
            title={"Application Request Form"}
          >
            <ParentRequestPreview
              parentRequestId={parentRequestId}
              onClose={() => openApplicationForm(false)}
            />
          </ModalWrapper>
        )}
      </div>
    </div>
  );
};

export default PaymentVoucher;
