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
import DocumentAttachmentForm from "./DocumentAttachmentForm";
import type { Approver } from "./ClaimOutOfPocketExpenses";
import { isShowOrganizationDetail } from "../../common/constant";

interface Requestor {
  firstName?: string;
  lastName?: string;
  date?: string;
  department?: string;
  position?: string;
}

interface AnnualLeaveResumptionOfDutyForm {
  date: string;
  officerName?: string;
  leaveType?: string;
  requestor?: Requestor;
  approvers?: Approver[];
  attachments?: any[];
  [key: string]: any;
}

interface AnnualLeaveResumptionOfDutyProps {
  loading: boolean;
  setLoading: (value: boolean) => void;
  formResponses: Partial<AnnualLeaveResumptionOfDutyForm>;
  enableInputList?: string[];
  triggerVoucherCreation?: boolean;
  vissibleSections?: string[];
  onSubmit: (data: AnnualLeaveResumptionOfDutyForm, status: string) => void;
  onCancel: () => void;
  showActionButtons?: boolean;
  mode?: "edit" | "preview" | "new" | "in_progress";
  responseTypes: string[];
  showApprovers?: boolean;
  showAddDocument?: boolean;
}

const ALWAYS_REQUIRED: (keyof AnnualLeaveResumptionOfDutyForm)[] = [
  "date",
  "requestorDeligation",
];

// These are the fields rendered in this component that should be required when enabled/visible:
const UI_REQUIRED: (keyof AnnualLeaveResumptionOfDutyForm)[] = [
  "leaveType",
  "officerName",
  "departureDate",
  "resumptionDate",
  "rank",
  "phoneNo",
  "unit",
  "departureDate",
  "resumptionDate",
  "comments",
];

const AnnualLeaveResumptionOfDuty: React.FC<
  AnnualLeaveResumptionOfDutyProps
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

    const [formData, setFormData] = useState<AnnualLeaveResumptionOfDutyForm>({
      date: moment(new Date()).format("YYYY-MM-DD"),
      requestorDeligation: getFinanceCode(user),
      leaveType: "",
      ...formResponses,
    });

    const handleInputChange = (
      fieldId: keyof AnnualLeaveResumptionOfDutyForm,
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

    const getRequiredFields = (): (keyof AnnualLeaveResumptionOfDutyForm)[] => {
      const required: (keyof AnnualLeaveResumptionOfDutyForm)[] = [
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
            leaveType: "Leave Type",
            officerName: "Name of Officer",
            departureDate: "Departure Date",
            resumptionDate: "Resumption Date",
            rank: "Rank",
            phoneNo: "Phone Number",
            unit: "Unit",
            comments: "Comments",
          };
          nextErrors[field as string] = `${labelMap[field as string] ?? field
            } is required.`;
        }
      }

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
      field: keyof AnnualLeaveResumptionOfDutyForm,
      also = ""
    ) =>
      `w-full p-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${errors[field as string] ? "border-red-500" : "border-gray-300"
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
                Annual Leave Resumption of Duty Form
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

          <p className="mt-4">
            {" "}
            To be completed by an Officer returning from Leave and to be counter
            signeed by his/here HOD/HOU
          </p>
          <>
            <div className="flex flex-col md:flex-row items-start md:items-center mt-2">
              <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                <span className="text-sm">Leave Type:</span>
              </div>

              <div className="w-full">
                <select
                  value={formData?.leaveType ?? ""}
                  disabled={!isEnabled("leaveType")}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    handleInputChange("leaveType", e.target.value)
                  }
                  className={inputClass("leaveType")}
                  data-error={!!errors.leaveType}
                >
                  <option value="" disabled>
                    -- Select leave type --
                  </option>
                  <option value="annual_leave">Annual Leave</option>
                  <option value="sick_leave">Sick Leave</option>
                  <option value="maternity_leave">Maternity Leave</option>
                  <option value="paternity_leave">Paternity Leave</option>
                  <option value="compassionate_leave">Compassionate Leave</option>
                  <option value="others">Others</option>
                </select>

                {errors.leaveType && (
                  <p className="text-xs text-red-600 mt-1">{errors.leaveType}</p>
                )}

                {/* Optional: if "others", show a text input for specification */}
                {formData?.leaveType === "others" && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={formData?.leaveTypeOther ?? ""}
                      disabled={!isEnabled("leaveTypeOther")}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleInputChange("leaveTypeOther" as any, e.target.value)
                      }
                      placeholder="Specify other leave type"
                      className={inputClass("leaveTypeOther" as any)}
                    />
                  </div>
                )}
              </div>
            </div>

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

            <div className="flex flex-col md:flex-row items-start md:items-center">
              <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                <span className="text-sm ">Phone Number</span>
              </div>
              <div className="w-full">
                <input
                  type="text"
                  value={formData?.phoneNo ?? ""}
                  disabled={!isEnabled("phoneNo")}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("phoneNo", e.target.value)
                  }
                  className={inputClass("phoneNo")}
                  data-error={!!errors.phoneNo}
                />
                {errors.phoneNo && (
                  <p className="text-xs text-red-600 mt-1">{errors.phoneNo}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center">
              <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                <span className="text-sm ">Department</span>
              </div>
              <div className="w-full">
                <input
                  type="text"
                  value={formData?.department ?? ""}
                  disabled={!isEnabled("department")}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("department", e.target.value)
                  }
                  className={inputClass("department")}
                  data-error={!!errors.department}
                />
                {errors.department && (
                  <p className="text-xs text-red-600 mt-1">{errors.department}</p>
                )}
              </div>
            </div>

            <div className="my-1 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-2">
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                  <span className="text-sm ">Rank/Position</span>
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
                  <span className="text-sm ">Unit</span>
                </div>
                <div className="w-full">
                  <input
                    type="text"
                    value={formData?.unit ?? ""}
                    disabled={!isEnabled("unit")}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("unit", e.target.value)
                    }
                    className={inputClass("unit")}
                    data-error={!!errors.unit}
                  />
                  {errors.unit && (
                    <p className="text-xs text-red-600 mt-1">{errors.unit}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="my-1 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-2">
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                  <span className="text-sm ">Date of Departure</span>
                </div>
                <div className="w-full">
                  <input
                    type="date"
                    value={formData?.departureDate ?? ""}
                    disabled={!isEnabled("departureDate")}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("departureDate", e.target.value)
                    }
                    className={inputClass("departureDate")}
                    data-error={!!errors.departureDate}
                  />
                  {errors.departureDate && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.departureDate}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                  <span className="text-sm ">Date of Resumption</span>
                </div>
                <div className="w-full">
                  <input
                    type="date"
                    value={formData?.resumptionDate ?? ""}
                    disabled={!isEnabled("resumptionDate")}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("resumptionDate", e.target.value)
                    }
                    className={inputClass("resumptionDate")}
                    data-error={!!errors.resumptionDate}
                  />
                  {errors.resumptionDate && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.resumptionDate}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="">
              <h3 className="text-sm text-gray-700">Other comments</h3>
              <div>
                <textarea
                  name="comments"
                  id="comments"
                  value={formData?.comments || ""}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    handleInputChange("comments", e.target.value)
                  }
                  disabled={!isEnabled("comments")}
                  className={inputClass("comments")}
                  rows={3}
                  data-error={!!errors.comments}
                ></textarea>
                {errors.comments && (
                  <p className="text-xs text-red-600 mt-1">{errors.comments}</p>
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

export default AnnualLeaveResumptionOfDuty;
