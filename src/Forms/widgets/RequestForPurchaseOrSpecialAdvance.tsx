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
import type { EmployeeOption } from "./PaymentVoucher-auto";
import DocumentAttachmentForm from "./DocumentAttachmentForm";

// --- Types ---

interface Requestor {
  firstName?: string;
  lastName?: string;
  date?: string;
  department?: string;
  position?: string;
}

interface Approver {
  firstName: string;
  lastName: string;
  date?: string;
  department?: string;
  position?: string;
  label?: string;
}

interface RequestForPurchaseOrSpecialAdvanceForm {
  date: string;
  location?: string;
  description?: string;
  recommendationNotes?: string;
  requestorDeligation?: string;
  requestor?: Requestor;
  approvers?: Approver[];
  // for compatibility with spread
  [key: string]: any;
}

interface RequestForPurchaseOrSpecialAdvanceProps {
  loading: boolean;
  setLoading: (value: boolean) => void;
  formResponses: Partial<RequestForPurchaseOrSpecialAdvanceForm>;
  enableInputList?: string[];
  trigerVoucherCreation?: boolean;
  vissibleSections?: string[];
  onSubmit: (
    data: RequestForPurchaseOrSpecialAdvanceForm,
    status: string
  ) => void;
  onCancel: () => void;
  showActionButtons?: boolean;
  mode?: "edit" | "preview" | "new" | "in_progress";
  responseTypes: string[];
}

const requiredFields: (keyof RequestForPurchaseOrSpecialAdvanceForm)[] = [
  "requestorDeligation",
  "date",
  "location",
  "description",
  "unitVoucherHeadById",
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
  trigerVoucherCreation,
  loading = false,
  setLoading,
}) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const downloadPdf = useDownloadPdf();
  const { user } = useAuth();
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

  // Handle text, textarea, and date inputs
  const handleInputChange = (
    fieldId: keyof RequestForPurchaseOrSpecialAdvanceForm,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      ...formResponses,
    }));
  }, [formResponses]);

  const isEnabled = (name: string) => enableInputList.includes(name);

  // Validation: check enabled required fields
  const checkIsValid = () => {
    const required = [];
    for (let enableField of enableInputList) {
      if (requiredFields.includes(enableField) && !formData?.[enableField])
        required.push(enableField);
    }

    return !!required.length;
  };

  const handleSubmit = (status: string) => {
    if (!checkIsValid()) {
      setLoading(true);
      onSubmit(formData, status);
      // Reset only non-default fields
      // setFormData({
      //   date: moment(new Date()).format("YYYY-MM-DD"),
      //   requestorDeligation: getFinanceCode(user),
      // });
      setHasErrors(false);
    } else {
      setHasErrors(true);
    }
  };

  const handleCancel = () => {
    setFormData({
      date: moment(new Date()).format("YYYY-MM-DD"),
      requestorDeligation: getFinanceCode(user),
    });
    onCancel();
  };

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
              There are some errors or missing required fields
            </p>
          </div>
        )}

        <p className="mt-4"></p>
        <>
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
                className={`mt-1 w-full p-1 border ${
                  isEnabled("officerName")
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
              />
            </div>
          </div>

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
                  className={`w-full p-1 border ${
                    isEnabled("rank") ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center">
              <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                <span className="text-sm ">CONTISS</span>
              </div>
              <div className="w-full">
                <input
                  type="text"
                  value={formData?.contiss}
                  disabled={!isEnabled("contiss")}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("contiss", e.target.value)
                  }
                  className={`w-full p-1 border ${
                    isEnabled("contiss") ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center">
              <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                <span className="text-sm ">COMP No</span>
              </div>
              <div className="w-full">
                <input
                  type="text"
                  value={formData?.compNo}
                  disabled={!isEnabled("compNo")}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("compNo", e.target.value)
                  }
                  className={`w-full p-1 border ${
                    isEnabled("compNo") ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                />
              </div>
            </div>
          </div>

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
                className={`mt-0 w-full p-1 border ${
                  isEnabled("purpose") ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                rows={3}
              ></textarea>
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
                  className={`mt-1 w-full p-1 border ${
                    isEnabled("bank") ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                />
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
                  className={`mt-1 w-full p-1 border ${
                    isEnabled("accountNumber")
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                />
              </div>
            </div>
          </div>

          <div className=" my-1 flex flex-col md:flex-row items-start md:items-center">
            <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
              <span className="text-sm ">
                Outstanding Balance yet to be retired:
              </span>
            </div>
            <div className="w-full">
              <input
                type="text"
                value={formData?.outstandingBalance}
                disabled={!isEnabled("outstandingBalance")}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("outstandingBalance", e.target.value)
                }
                className={`w-full p-1 border ${
                  isEnabled("outstandingBalance")
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
              />
            </div>
          </div>

          <div className="mb-0 md:mb-0 md:mr-2 min-w-max">
            <span className="text-sm ">Amount of Advance Required:</span>
          </div>
          <div className="w-full">
            <input
              type="text"
              value={formData?.advanceAmount}
              disabled={!isEnabled("advanceAmount")}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleInputChange("advanceAmount", e.target.value)
              }
              className={`w-full p-1 border ${
                isEnabled("advanceAmount")
                  ? "border-red-500"
                  : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
            />
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
                className={`mt-1 w-full p-1 border ${
                  isEnabled("totalInWord")
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                rows={2}
              ></textarea>
            </div>
          </div>

          <DocumentAttachmentForm
            onSubmit={(documents) =>
              setFormData((prev) => ({ ...prev, attachments: documents }))
            }
            mode="new"
            initialDocuments={formData?.attachments || []}
          />

          {trigerVoucherCreation && (
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
                    required
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
              </div>
            </div>
          )}
        </>

        {/* Signers row (flex + wrap, nice spacing) */}
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
                formData?.requestor?.department || user?.department?.name || ""
              }
              position={
                formData?.requestor?.position || user?.position?.title || ""
              }
              label="Request by"
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
