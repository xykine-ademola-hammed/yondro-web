import React, { useEffect, useRef, useState, type RefObject } from "react";
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

interface RequestForLeaveForm {
  date: string;
  leaveType?: "annual" | "casual" | "maternity" | "paternity";

  // Section A
  officerName?: string;
  department?: string;
  unit?: string;
  rank?: string;
  levelSteps?: string; // CONPCASS/CONTEDISS Level & Step
  numberOfDays?: string;
  leaveYear?: string; // If Annual Leave
  commencementDate?: string;
  phoneNumber?: string;
  addressOnLeave?: string;

  // Section B
  hodRelease?: "yes" | "no";
  hodComments?: string;
  hodName?: string;

  // Section C
  deanName?: string;
  deanDesignation?: string; // Usually Dean

  // Section D
  registrarApprovalDate?: string;
  approvedDepartureDate?: string;

  // Section E
  leaveEntitlement?: string;
  deductionFromLeave?: string;
  balanceFromLeave?: string;
  totalDeferredLeave?: string;
  dateReturning?: string;

  requestorDeligation?: string;
  requestor?: Requestor;
  approvers?: Approver[];
  attachments?: any[];
  [key: string]: any;
}

interface RequestForLeaveProps {
  loading: boolean;
  setLoading: (value: boolean) => void;
  formResponses: Partial<RequestForLeaveForm>;
  enableInputList?: string[];
  triggerVoucherCreation?: boolean;
  vissibleSections?: string[];
  onSubmit: (data: RequestForLeaveForm, status: string) => void;
  onCancel: () => void;
  showActionButtons?: boolean;
  mode?: "edit" | "preview" | "new" | "in_progress";
  responseTypes: string[];
  showApprovers?: boolean;
  showAddDocument?: boolean;
}

const ALWAYS_REQUIRED: (keyof RequestForLeaveForm)[] = [
  "date",
  "requestorDeligation",
];

const UI_REQUIRED: (keyof RequestForLeaveForm)[] = [
  "leaveType",
  "officerName",
  "department",
  "rank",
  "levelSteps",
  "numberOfDays",
  "commencementDate",
  "phoneNumber",
  "addressOnLeave",
];

const RequestForLeave: React.FC<RequestForLeaveProps> = ({
  formResponses,
  enableInputList = [""],
  onSubmit,
  onCancel,
  showActionButtons = false,
  mode = "new",
  responseTypes = [""],
  loading = false,
  setLoading,
  showAddDocument = true,
}) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const downloadPdf = useDownloadPdf();
  const { user } = useAuth();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasErrors, setHasErrors] = useState<boolean>(false);

  const [formData, setFormData] = useState<RequestForLeaveForm>({
    date: moment(new Date()).format("YYYY-MM-DD"),
    requestorDeligation: getFinanceCode(user),
    ...formResponses,
  });

  const handleInputChange = (
    fieldId: keyof RequestForLeaveForm,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
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

  const getRequiredFields = (): (keyof RequestForLeaveForm)[] => {
    const required: (keyof RequestForLeaveForm)[] = [...ALWAYS_REQUIRED];
    for (const f of UI_REQUIRED) {
      if (isEnabled(f as string)) required.push(f);
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
        const labelMap: Record<string, string> = {
          date: "Date",
          requestorDeligation: "Requestor Delegation",
          leaveType: "Leave Type",
          officerName: "Name",
          department: "Department",
          rank: "Rank/Position",
          levelSteps: "CONPCASS/CONTEDISS Level",
          numberOfDays: "Number of Days Desired",
          commencementDate: "Date of Commencement",
          phoneNumber: "Phone Number",
          addressOnLeave: "Address while on Leave",
        };
        nextErrors[field as string] = `${
          labelMap[field as string] ?? field
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

  const inputClass = (field: keyof RequestForLeaveForm, also = "") =>
    `w-full p-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
      errors[field as string] ? "border-red-500" : "border-gray-300"
    } ${also}`;

  const renderCheckbox = (
    type: "annual" | "casual" | "maternity" | "paternity",
    label: string,
  ) => (
    <label className="flex items-center mr-4 space-x-2 cursor-pointer">
      <input
        type="checkbox"
        checked={formData.leaveType === type}
        disabled={!isEnabled("leaveType")}
        onChange={() => handleInputChange("leaveType", type)}
        className="form-checkbox h-4 w-4 text-blue-600"
      />
      <span className="uppercase text-sm font-bold">{label}</span>
    </label>
  );

  return (
    <div>
      <div className="flex justify-end items-end no-print">
        <button
          className="px-2 py-1 bg-blue-900 text-white rounded"
          onClick={() =>
            downloadPdf(componentRef as RefObject<HTMLElement>, {
              fileName: "request-for-leave.pdf",
              orientation: "portrait",
              format: "a4",
              margin: 10,
              scale: 1,
              hideSelectors: [".no-print"],
            })
          }
        >
          Download
        </button>
      </div>

      <div
        ref={componentRef}
        className="bg-white rounded-lg sm:p-4 w-full max-w-4xl border-2 border-gray-300 p-2"
      >
        {/* Header */}
        <div className="flex gap-4 mb-2 border-b-2 border-black pb-2 items-center">
          {isShowOrganizationDetail && (
            <img src={spedLogo} alt="Logo" className="h-20 w-auto" />
          )}
          <div className="flex-1 text-center">
            <h2 className="text-xl font-extrabold uppercase text-gray-800">
              {isShowOrganizationDetail
                ? user?.organization?.name
                : "FEDERAL COLLEGE OF EDUCATION (SPECIAL), OYO"}
            </h2>
            <h3 className="text-sm font-bold uppercase mt-1 text-gray-700">
              REQUEST FOR ANNUAL/CASUAL/MATERNITY LEAVE
            </h3>
            <div className="flex justify-between text-xs mt-2 px-4 font-bold">
              <span>FILE NO.: ______________________</span>
              <span>ORIGINAL</span>
              <span>PAD/FORM NO.: 2025ALF</span>
            </div>
          </div>
        </div>

        {hasErrors && (
          <div className="bg-red-50 p-2 rounded-lg mb-2 no-print">
            <p className="text-red-800 text-sm">Please fix the errors below.</p>
          </div>
        )}

        {/* Note / Leave Type */}
        <div className="mb-4 bg-gray-50 p-2 border border-gray-200">
          <p className="text-xs italic mb-2">
            Note: Please, tick the type of Leave being requested
          </p>
          <div className="flex flex-wrap" data-error={!!errors.leaveType}>
            {renderCheckbox("annual", "ANNUAL")}
            {renderCheckbox("casual", "CASUAL")}
            {renderCheckbox("maternity", "MATERNITY")}
            {renderCheckbox("paternity", "PATERNITY")}
          </div>
          {errors.leaveType && (
            <p className="text-xs text-red-600 mt-1">{errors.leaveType}</p>
          )}
        </div>

        {/* SECTION A */}
        <div className="mb-4">
          <h4 className="font-bold text-sm bg-gray-100 p-1 mb-2">
            SECTION A: (To be completed by Applicant)
          </h4>
          <div className="space-y-2">
            {/* Name */}
            <div className="flex items-center">
              <span className="text-sm w-32 font-semibold">Name:</span>
              <input
                type="text"
                value={formData.officerName ?? ""}
                disabled={!isEnabled("officerName")}
                onChange={(e) =>
                  handleInputChange("officerName", e.target.value)
                }
                className={inputClass(
                  "officerName",
                  "flex-1 border-b border-t-0 border-x-0 rounded-none focus:ring-0 px-0 h-6",
                )}
              />
            </div>

            {/* Dept + Unit */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center flex-1">
                <span className="text-sm w-32 font-semibold">Department:</span>
                <input
                  type="text"
                  value={formData.department ?? ""}
                  disabled={!isEnabled("department")}
                  onChange={(e) =>
                    handleInputChange("department", e.target.value)
                  }
                  className={inputClass(
                    "department",
                    "flex-1 border-b border-t-0 border-x-0 rounded-none focus:ring-0 px-0 h-6",
                  )}
                />
              </div>
              <div className="flex items-center flex-1">
                <span className="text-sm w-16 font-semibold">Unit:</span>
                <input
                  type="text"
                  value={formData.unit ?? ""}
                  disabled={!isEnabled("unit")}
                  onChange={(e) => handleInputChange("unit", e.target.value)}
                  className={inputClass(
                    "unit",
                    "flex-1 border-b border-t-0 border-x-0 rounded-none focus:ring-0 px-0 h-6",
                  )}
                />
              </div>
            </div>

            {/* Rank */}
            <div className="flex items-center">
              <span className="text-sm w-32 font-semibold">Rank/Position:</span>
              <input
                type="text"
                value={formData.rank ?? ""}
                disabled={!isEnabled("rank")}
                onChange={(e) => handleInputChange("rank", e.target.value)}
                className={inputClass(
                  "rank",
                  "flex-1 border-b border-t-0 border-x-0 rounded-none focus:ring-0 px-0 h-6",
                )}
              />
            </div>

            {/* Level + Step */}
            <div className="flex items-center">
              <span className="text-sm min-w-max mr-2 font-semibold">
                CONPCASS/CONTEDISS Level:
              </span>
              <input
                type="text"
                value={formData.levelSteps ?? ""}
                disabled={!isEnabled("levelSteps")}
                onChange={(e) =>
                  handleInputChange("levelSteps", e.target.value)
                }
                className={inputClass(
                  "levelSteps",
                  "flex-1 border-b border-t-0 border-x-0 rounded-none focus:ring-0 px-0 h-6",
                )}
                placeholder="e.g. 7 Step 2"
              />
            </div>

            {/* Days Desired + Leave Year */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center flex-1">
                <span className="text-sm min-w-max mr-2 font-semibold">
                  Number of Days Desired:
                </span>
                <input
                  type="text" // using text allow '14 days'
                  value={formData.numberOfDays ?? ""}
                  disabled={!isEnabled("numberOfDays")}
                  onChange={(e) =>
                    handleInputChange("numberOfDays", e.target.value)
                  }
                  className={inputClass(
                    "numberOfDays",
                    "flex-1 border-b border-t-0 border-x-0 rounded-none focus:ring-0 px-0 h-6",
                  )}
                />
              </div>
              {formData.leaveType === "annual" && (
                <div className="flex items-center flex-1">
                  <span className="text-sm min-w-max mr-2 font-semibold">
                    If Annual Leave, State Leave Year:
                  </span>
                  <input
                    type="text"
                    value={formData.leaveYear ?? ""}
                    disabled={!isEnabled("leaveYear")}
                    onChange={(e) =>
                      handleInputChange("leaveYear", e.target.value)
                    }
                    className={inputClass(
                      "leaveYear",
                      "flex-1 border-b border-t-0 border-x-0 rounded-none focus:ring-0 px-0 h-6",
                    )}
                  />
                </div>
              )}
            </div>

            {/* Commencement + Phone */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center flex-1">
                <span className="text-sm min-w-max mr-2 font-semibold">
                  Date of Commencement:
                </span>
                <input
                  type="date"
                  value={formData.commencementDate ?? ""}
                  disabled={!isEnabled("commencementDate")}
                  onChange={(e) =>
                    handleInputChange("commencementDate", e.target.value)
                  }
                  className={inputClass(
                    "commencementDate",
                    "flex-1 border-b border-t-0 border-x-0 rounded-none focus:ring-0 px-0 h-6",
                  )}
                />
              </div>
              <div className="flex items-center flex-1">
                <span className="text-sm font-semibold mr-2">
                  Phone Number:
                </span>
                <input
                  type="text"
                  value={formData.phoneNumber ?? ""}
                  disabled={!isEnabled("phoneNumber")}
                  onChange={(e) =>
                    handleInputChange("phoneNumber", e.target.value)
                  }
                  className={inputClass(
                    "phoneNumber",
                    "flex-1 border-b border-t-0 border-x-0 rounded-none focus:ring-0 px-0 h-6",
                  )}
                />
              </div>
            </div>

            {/* Address */}
            <div className="flex items-center">
              <span className="text-sm min-w-max mr-2 font-semibold">
                Address while on Leave:
              </span>
              <input
                type="text"
                value={formData.addressOnLeave ?? ""}
                disabled={!isEnabled("addressOnLeave")}
                onChange={(e) =>
                  handleInputChange("addressOnLeave", e.target.value)
                }
                className={inputClass(
                  "addressOnLeave",
                  "flex-1 border-b border-t-0 border-x-0 rounded-none focus:ring-0 px-0 h-6",
                )}
              />
            </div>
          </div>
        </div>

        {/* SECTION B */}
        <div className="mb-4 border-t border-gray-300 pt-2">
          <h4 className="font-bold text-sm bg-gray-100 p-1 mb-2">
            SECTION B: (To be completed by the Head of Department/Unit)
          </h4>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="text-sm mr-2">
                Can you release the applicant for the period desired?:
              </span>
              <select
                value={formData.hodRelease ?? ""}
                disabled={!isEnabled("hodRelease")}
                onChange={(e) =>
                  handleInputChange("hodRelease", e.target.value as any)
                }
                className="bg-transparent border-b border-gray-400 focus:outline-none text-sm"
              >
                <option value="">Select...</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div className="flex flex-col">
              <span className="text-sm mb-1">
                Any other Comments/Recommendations:
              </span>
              <textarea
                value={formData.hodComments ?? ""}
                disabled={!isEnabled("hodComments")}
                onChange={(e) =>
                  handleInputChange("hodComments", e.target.value)
                }
                rows={2}
                className={inputClass(
                  "hodComments",
                  "w-full border p-1 rounded resize-none",
                )}
              />
            </div>
            {/* <div className="flex items-center mt-2">
              <span className="text-sm mr-2 font-semibold">
                Name of Head of Department/Unit:
              </span>
              <input
                type="text"
                value={formData.hodName ?? ""}
                disabled={!isEnabled("hodName")}
                onChange={(e) => handleInputChange("hodName", e.target.value)}
                className={inputClass(
                  "hodName",
                  "flex-1 border-b border-t-0 border-x-0 rounded-none focus:ring-0 px-0 h-6",
                )}
              />
            </div> */}
            {/* Signer for HOD */}
            {/* <div className="mt-4 flex justify-end">
              <div className="w-64 text-center">
                <div className="border-b border-dotted border-gray-400 mb-1 h-8"></div>
                <p className="text-xs font-bold italic">Signature/Date</p>
              </div>
            </div> */}
          </div>
        </div>

        <div>
          {/* <div className="mb-4 border-t border-gray-300 pt-2"> */}
          {/* <h4 className="font-bold text-sm bg-gray-100 p-1 mb-2">
              SECTION C: (Recommendation of Dean where applicable)
            </h4> */}
          {/* <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <span className="text-sm block font-semibold mb-1">
                  Name of the Dean:
                </span>
                <input
                  type="text"
                  value={formData.deanName ?? ""}
                  disabled={!isEnabled("deanName")}
                  onChange={(e) =>
                    handleInputChange("deanName", e.target.value)
                  }
                  className={inputClass(
                    "deanName",
                    "w-full border-b border-t-0 border-x-0 rounded-none focus:ring-0 px-0 h-6",
                  )}
                />
              </div>
              <div className="flex-1 w-full">
                <span className="text-sm block font-semibold mb-1">
                  Designation:
                </span>
                <input
                  type="text"
                  value={formData.deanDesignation ?? ""}
                  disabled={!isEnabled("deanDesignation")}
                  onChange={(e) =>
                    handleInputChange("deanDesignation", e.target.value)
                  }
                  className={inputClass(
                    "deanDesignation",
                    "w-full border-b border-t-0 border-x-0 rounded-none focus:ring-0 px-0 h-6",
                  )}
                />
              </div>
            </div> */}
          {/* Signer for Dean */}
          {/* <div className="mt-4 flex justify-end">
              <div className="w-64 text-center">
                <div className="border-b border-dotted border-gray-400 mb-1 h-8"></div>
                <p className="text-xs font-bold italic">Signature/Date</p>
              </div>
            </div> */}
          {/* </div> */}

          {/* <div className="mb-4 border-t border-gray-300 pt-2">
            <h4 className="font-bold text-sm bg-gray-100 p-1 mb-2">
              SECTION D: (Approval by the Registrar/Provost)
            </h4>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px] border-b border-dotted border-gray-400 h-8 self-end">
                <span className="text-xs text-gray-400">Signature</span>
              </div>
              <div className="flex-1 min-w-[150px] flex items-end">
                <span className="text-sm mr-2 font-semibold">Date:</span>
                <input
                  type="date"
                  value={formData.registrarApprovalDate ?? ""}
                  disabled={!isEnabled("registrarApprovalDate")}
                  onChange={(e) =>
                    handleInputChange("registrarApprovalDate", e.target.value)
                  }
                  className="flex-1 border-b border-t-0 border-x-0 rounded-none focus:ring-0 px-0 h-6 text-sm"
                />
              </div>
              <div className="flex-1 min-w-[150px] flex items-end">
                <span className="text-sm mr-2 font-semibold">
                  Date of Departure:
                </span>
                <input
                  type="date"
                  value={formData.approvedDepartureDate ?? ""}
                  disabled={!isEnabled("approvedDepartureDate")}
                  onChange={(e) =>
                    handleInputChange("approvedDepartureDate", e.target.value)
                  }
                  className="flex-1 border-b border-t-0 border-x-0 rounded-none focus:ring-0 px-0 h-6 text-sm"
                />
              </div>
            </div>
          </div> */}
        </div>

        {/* SECTION E */}
        <div className="mb-4 border-t border-gray-300 pt-2">
          <h4 className="font-bold text-sm bg-gray-100 p-1 mb-2">
            SECTION C: (To be completed by the Personnel Affairs Officer)
          </h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center">
              <span className="w-8">a</span>
              <span className="w-64">Leave Entitlement:</span>
              <input
                type="text"
                value={formData.leaveEntitlement ?? ""}
                disabled={!isEnabled("leaveEntitlement")}
                onChange={(e) =>
                  handleInputChange("leaveEntitlement", e.target.value)
                }
                className="w-24 border-b border-t-0 border-x-0 rounded-none focus:ring-0 text-center mx-2 h-5"
              />
              <span>Day(s)</span>
            </div>
            <div className="flex items-center">
              <span className="w-8">b</span>
              <span className="w-64">Deduction from Leave Entitlement:</span>
              <input
                type="text"
                value={formData.deductionFromLeave ?? ""}
                disabled={!isEnabled("deductionFromLeave")}
                onChange={(e) =>
                  handleInputChange("deductionFromLeave", e.target.value)
                }
                className="w-24 border-b border-t-0 border-x-0 rounded-none focus:ring-0 text-center mx-2 h-5"
              />
              <span>Day(s)</span>
            </div>
            <div className="flex items-center">
              <span className="w-8">c</span>
              <span className="w-64">Balance from Leave Entitlement:</span>
              <input
                type="text"
                value={formData.balanceFromLeave ?? ""}
                disabled={!isEnabled("balanceFromLeave")}
                onChange={(e) =>
                  handleInputChange("balanceFromLeave", e.target.value)
                }
                className="w-24 border-b border-t-0 border-x-0 rounded-none focus:ring-0 text-center mx-2 h-5"
              />
              <span>Day(s)</span>
            </div>
            <div className="flex items-center">
              <span className="w-8">d</span>
              <span className="w-64">Total Deferred Leave:</span>
              <input
                type="text"
                value={formData.totalDeferredLeave ?? ""}
                disabled={!isEnabled("totalDeferredLeave")}
                onChange={(e) =>
                  handleInputChange("totalDeferredLeave", e.target.value)
                }
                className="w-24 border-b border-t-0 border-x-0 rounded-none focus:ring-0 text-center mx-2 h-5"
              />
              <span>Day(s)</span>
            </div>
            <div className="flex items-center">
              <span className="w-8">e</span>
              <span className="w-64">Date returning from Leave:</span>
              <input
                type="date"
                value={formData.dateReturning ?? ""}
                disabled={!isEnabled("dateReturning")}
                onChange={(e) =>
                  handleInputChange("dateReturning", e.target.value)
                }
                className="w-32 border-b border-t-0 border-x-0 rounded-none focus:ring-0 text-center mx-2 h-5 text-xs"
              />
              {/* <span>Day(s)</span> (Form image has Day(s) here but it's a date field usually, following image label) */}
              <span>Day(s)</span>
            </div>
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

        {/* Action Buttons */}
        {showActionButtons && (
          <div className="mt-4 no-print">
            <FormActions
              loading={loading}
              handleCancel={handleCancel}
              mode={mode}
              handleSubmit={handleSubmit}
              responseTypes={responseTypes}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestForLeave;
