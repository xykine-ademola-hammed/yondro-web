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

interface StaffIdCardDataFormStruct {
  date: string; // Used for "Date" fields generally if needed, or created date

  // Header
  fileNo?: string;

  // Personal Details
  surnameFirst?: string;
  department?: string;
  dob?: string;
  sex?: string;
  computerNo?: string;
  phoneNo?: string;
  rank?: string;
  designation?: string;
  dateOfAppointment?: string;
  permanentAddress?: string;

  // Reason
  reasonNewStaff?: boolean;
  reasonPromotion?: boolean;
  reasonLoss?: boolean;

  // Next of Kin
  nextOfKinNameAddress?: string;
  nextOfKinPhone?: string;

  // Official Use
  verifiedBy?: string;
  isInformationCorrect?: "correct" | "not_correct";
  recommendation?: "recommend" | "do_not_recommend";
  officialName?: string; // Name of verifier
  officialDate?: string;

  registrarDate?: string; // Approved by Registrar Date

  requestorDeligation?: string;
  requestor?: Requestor;
  approvers?: Approver[];
  attachments?: any[];
  [key: string]: any;
}

interface StaffIdCardDataFormProps {
  loading: boolean;
  setLoading: (value: boolean) => void;
  formResponses: Partial<StaffIdCardDataFormStruct>;
  enableInputList?: string[];
  triggerVoucherCreation?: boolean;
  vissibleSections?: string[];
  onSubmit: (data: StaffIdCardDataFormStruct, status: string) => void;
  onCancel: () => void;
  showActionButtons?: boolean;
  mode?: "edit" | "preview" | "new" | "in_progress";
  responseTypes: string[];
  showApprovers?: boolean;
  showAddDocument?: boolean;
}

const ALWAYS_REQUIRED: (keyof StaffIdCardDataFormStruct)[] = [
  "date",
  "requestorDeligation",
];

const UI_REQUIRED: (keyof StaffIdCardDataFormStruct)[] = [
  "surnameFirst",
  "department",
  "dob",
  "phoneNo",
  "rank",
  "dateOfAppointment",
  "permanentAddress",
];

const StaffIdCardDataForm: React.FC<StaffIdCardDataFormProps> = ({
  formResponses,
  enableInputList = [""],
  onSubmit,
  onCancel,
  showActionButtons = false,
  mode = "new",
  responseTypes = [""],
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

  const [formData, setFormData] = useState<StaffIdCardDataFormStruct>({
    date: moment(new Date()).format("YYYY-MM-DD"),
    requestorDeligation: getFinanceCode(user),
    ...formResponses,
  });

  const handleInputChange = (
    fieldId: keyof StaffIdCardDataFormStruct,
    value: any,
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

  const getRequiredFields = (): (keyof StaffIdCardDataFormStruct)[] => {
    const required: (keyof StaffIdCardDataFormStruct)[] = [...ALWAYS_REQUIRED];
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
          surnameFirst: "Name (Surname First)",
          department: "Department",
          dob: "Date of Birth",
          phoneNo: "Phone No",
          rank: "Present Rank",
          dateOfAppointment: "Date of Appointment",
          permanentAddress: "Holder's Permanent Address",
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

  const inputClass = (field: keyof StaffIdCardDataFormStruct, also = "") =>
    `w-full p-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
      errors[field as string] ? "border-red-500" : "border-gray-300"
    } ${also}`;

  const renderReasonCheckbox = (
    field: keyof StaffIdCardDataFormStruct,
    label: string,
  ) => (
    <div className="flex items-center space-x-2 mr-6">
      <span className="text-sm font-semibold w-24">{label}:</span>
      <label className="flex items-center gap-1 cursor-pointer">
        <input
          type="checkbox"
          checked={!!formData[field]}
          disabled={!isEnabled(field as string)}
          onChange={(e) => handleInputChange(field, e.target.checked)}
          className="form-checkbox h-4 w-4 text-blue-600"
        />
        <span className="text-xs">YES</span>
      </label>
      <label className="flex items-center gap-1 cursor-pointer">
        <input
          type="checkbox"
          checked={formData[field] === false} // Only check 'NO' if strictly false, not undefined
          disabled={!isEnabled(field as string)}
          onChange={(e) => handleInputChange(field, !e.target.checked)} // Toggle logic slightly different for dual checkbox simulation
          className="form-checkbox h-4 w-4 text-blue-600"
        />
        <span className="text-xs">NO</span>
      </label>
    </div>
  );

  return (
    <div>
      <div className="flex justify-end items-end no-print">
        <button
          className="px-2 py-1 bg-blue-900 text-white rounded"
          onClick={() =>
            downloadPdf(componentRef as RefObject<HTMLElement>, {
              fileName: "staff-id-card-form.pdf",
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
        <div className="flex justify-between items-start mb-2 border-b-2 border-black pb-2">
          <div className="flex-1 text-center px-4">
            {isShowOrganizationDetail && (
              <img src={spedLogo} alt="Logo" className="h-16 w-auto mx-auto" />
            )}
            <h2 className="text-lg font-extrabold uppercase text-gray-800">
              {isShowOrganizationDetail
                ? user?.organization?.name
                : "FEDERAL COLLEGE OF EDUCATION (SPECIAL), OYO"}
            </h2>
            <h3 className="text-md font-bold text-gray-600">
              Personnel Affairs Division
            </h3>

            <h1 className="text-xl font-black uppercase mt-2 text-gray-800 tracking-wide">
              STAFF IDENTITY CARD DATA FORM
            </h1>
            <p className="text-[10px] italic">
              Note: To be completed in Duplicate. Attach two (2) recent
              Passports Photograph with green colour background
            </p>

            <div className="flex justify-between text-xs mt-2 font-bold border-t border-gray-300 pt-1">
              <div className="flex gap-1">
                <span>FILE NO.:</span>
                <input
                  type="text"
                  value={formData.fileNo ?? ""}
                  disabled={!isEnabled("fileNo")}
                  onChange={(e) => handleInputChange("fileNo", e.target.value)}
                  className="border-b border-black w-32 focus:outline-none h-4 bg-transparent"
                />
              </div>
              <span>PAD/I.D. CARD/FORM/.......</span>
            </div>
          </div>

          {/* Right Photo Box */}
          <div className="border border-gray-400 w-24 h-24 flex items-center justify-center text-center p-1 bg-gray-50">
            <span className="text-[10px] text-gray-500">
              Affix your Photograph Here
            </span>
          </div>
        </div>

        {hasErrors && (
          <div className="bg-red-50 p-2 rounded-lg mb-2 no-print">
            <p className="text-red-800 text-sm">Please fix the errors below.</p>
          </div>
        )}

        {/* Form Body border wrapper */}
        <div className="border border-gray-800 p-4 space-y-3">
          {/* Name */}
          <div className="flex items-center">
            <span className="text-sm w-44 font-semibold">
              Name:(Surname First)
            </span>
            <input
              type="text"
              value={formData.surnameFirst ?? ""}
              disabled={!isEnabled("surnameFirst")}
              onChange={(e) =>
                handleInputChange("surnameFirst", e.target.value)
              }
              className={inputClass(
                "surnameFirst",
                "flex-1 border-b border-t-0 border-x-0 rounded-none focus:ring-0 px-0 h-6",
              )}
            />
          </div>

          {/* Department + DOB */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center flex-[2]">
              <span className="text-sm w-24 font-semibold">Department:</span>
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
              <span className="text-sm w-24 font-semibold">Date of Birth:</span>
              <input
                type="date"
                value={formData.dob ?? ""}
                disabled={!isEnabled("dob")}
                onChange={(e) => handleInputChange("dob", e.target.value)}
                className={inputClass(
                  "dob",
                  "flex-1 border-b border-t-0 border-x-0 rounded-none focus:ring-0 px-0 h-6",
                )}
              />
            </div>
          </div>

          {/* Sex, Computer No, Phone */}
          <div className="flex flex-col md:flex-row gap-2">
            <div className="flex items-center flex-1">
              <span className="text-sm font-semibold mr-2">Sex:</span>
              <select
                value={formData.sex ?? ""}
                disabled={!isEnabled("sex")}
                onChange={(e) => handleInputChange("sex", e.target.value)}
                className={inputClass(
                  "sex",
                  "flex-1 border-b border-t-0 border-x-0 rounded-none focus:ring-0 px-0 h-6",
                )}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="flex items-center flex-1">
              <span className="text-sm font-semibold mr-2 min-w-max">
                Computer No.:
              </span>
              <input
                type="text"
                value={formData.computerNo ?? ""}
                disabled={!isEnabled("computerNo")}
                onChange={(e) =>
                  handleInputChange("computerNo", e.target.value)
                }
                className={inputClass(
                  "computerNo",
                  "flex-1 border-b border-t-0 border-x-0 rounded-none focus:ring-0 px-0 h-6",
                )}
              />
            </div>
            <div className="flex items-center flex-1">
              <span className="text-sm font-semibold mr-2 min-w-max">
                Phone No.:
              </span>
              <input
                type="text"
                value={formData.phoneNo ?? ""}
                disabled={!isEnabled("phoneNo")}
                onChange={(e) => handleInputChange("phoneNo", e.target.value)}
                className={inputClass(
                  "phoneNo",
                  "flex-1 border-b border-t-0 border-x-0 rounded-none focus:ring-0 px-0 h-6",
                )}
              />
            </div>
          </div>

          {/* Rank + Designation */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center flex-[2]">
              <span className="text-sm w-24 font-semibold">Present Rank:</span>
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
            <div className="flex items-center flex-1">
              <span className="text-sm w-24 font-semibold">Designation:</span>
              <input
                type="text"
                value={formData.designation ?? ""}
                disabled={!isEnabled("designation")}
                onChange={(e) =>
                  handleInputChange("designation", e.target.value)
                }
                className={inputClass(
                  "designation",
                  "flex-1 border-b border-t-0 border-x-0 rounded-none focus:ring-0 px-0 h-6",
                )}
              />
            </div>
          </div>
          <p className="text-[10px] italic ml-24 text-gray-500">
            (Please, state if NEW or OLD Staff)
          </p>

          {/* Date of Appointment */}
          <div className="flex items-center">
            <span className="text-sm min-w-max mr-2 font-semibold">
              Date of Appointment into the College:
            </span>
            <input
              type="date"
              value={formData.dateOfAppointment ?? ""}
              disabled={!isEnabled("dateOfAppointment")}
              onChange={(e) =>
                handleInputChange("dateOfAppointment", e.target.value)
              }
              className={inputClass(
                "dateOfAppointment",
                "flex-1 border-b border-t-0 border-x-0 rounded-none focus:ring-0 px-0 h-6",
              )}
            />
          </div>

          {/* Address */}
          <div className="flex items-center">
            <span className="text-sm min-w-max mr-2 font-semibold">
              Holder's Permanent Address:
            </span>
            <input
              type="text"
              value={formData.permanentAddress ?? ""}
              disabled={!isEnabled("permanentAddress")}
              onChange={(e) =>
                handleInputChange("permanentAddress", e.target.value)
              }
              className={inputClass(
                "permanentAddress",
                "flex-1 border-b border-t-0 border-x-0 rounded-none focus:ring-0 px-0 h-6",
              )}
            />
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-gray-400 my-4"></div>

          {/* N.B Section (Reasons) */}
          <div className="space-y-2">
            <p className="text-sm font-semibold italic mb-2">
              N.B: Please, state reason(s) why requesting for I.D. Card: (Tick
              applicably the box)
            </p>
            {renderReasonCheckbox("reasonNewStaff", "New Staff")}
            {renderReasonCheckbox("reasonPromotion", "Promotion")}
            {renderReasonCheckbox("reasonLoss", "Loss")}

            <p className="text-[11px] italic text-gray-600 mt-1">
              (If Loss, please, attach Police Reports and Sworn Current
              Affidavit)
            </p>
          </div>

          {/* Next of Kin */}
          <div className="mt-4 space-y-3">
            <div className="flex items-start">
              <span className="text-sm min-w-max mr-2 font-semibold">
                Name and Address of Next of Kin:
              </span>
              <textarea
                value={formData.nextOfKinNameAddress ?? ""}
                disabled={!isEnabled("nextOfKinNameAddress")}
                onChange={(e) =>
                  handleInputChange("nextOfKinNameAddress", e.target.value)
                }
                rows={2}
                className={inputClass(
                  "nextOfKinNameAddress",
                  "flex-1 border rounded focus:ring-0 text-sm",
                )}
              />
            </div>
            <div className="flex items-center w-full md:w-1/2">
              <span className="text-sm min-w-max mr-2 font-semibold">
                Telephone No. of Next of Kin:
              </span>
              <input
                type="text"
                value={formData.nextOfKinPhone ?? ""}
                disabled={!isEnabled("nextOfKinPhone")}
                onChange={(e) =>
                  handleInputChange("nextOfKinPhone", e.target.value)
                }
                className={inputClass(
                  "nextOfKinPhone",
                  "flex-1 border rounded h-8 px-2",
                )}
              />
            </div>
          </div>

          {/* Signature Boxes (Visual only, mapped to Signer logic below if strict) 
                 The image has dedicated boxes. I will try to replicate boxes visually but use Signer for data.
             */}
          <div className="flex justify-between items-end mt-6 px-4 gap-8">
            {/* Left Signature */}
            <div className="flex-1 text-center">
              <div className="border border-black h-12 rounded bg-gray-50 mb-1"></div>
              <p className="text-sm font-bold italic">Signature</p>
              <p className="text-[10px] text-gray-500">
                Please, sign within the space provided
              </p>
            </div>
            {/* Right Signature */}
            <div className="flex-1 text-center">
              <div className="border border-black h-12 rounded bg-gray-50 mb-1"></div>
              <p className="text-sm font-bold italic">Signature</p>
              <p className="text-[10px] text-gray-500">
                Please, sign within the space provided
              </p>
            </div>
          </div>
        </div>

        {/* OFFICIAL USE ONLY */}
        <div className="mt-4 p-4 bg-gray-50 border border-gray-300">
          <h4 className="font-bold text-sm uppercase mb-2 text-gray-600">
            FOR OFFICIAL USE ONLY
          </h4>

          <div className="space-y-3">
            {/* Verified By */}
            <div className="flex items-center">
              <span className="text-sm font-semibold mr-2">Verified By:</span>
              <input
                type="text"
                value={formData.verifiedBy ?? ""}
                disabled={!isEnabled("verifiedBy")}
                onChange={(e) =>
                  handleInputChange("verifiedBy", e.target.value)
                }
                className="flex-1 border-b border-gray-400 bg-transparent focus:outline-none h-6 text-sm"
              />
            </div>

            {/* I certify... */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm">
                I certify that the information given above is
              </span>
              <label className="flex items-center gap-1 cursor-pointer">
                <span className="text-sm italic font-bold">correct</span>
                <input
                  type="checkbox"
                  checked={formData.isInformationCorrect === "correct"}
                  disabled={!isEnabled("isInformationCorrect")}
                  onChange={() =>
                    handleInputChange("isInformationCorrect", "correct")
                  }
                  className="w-5 h-5 border border-black"
                />
              </label>
              <span className="text-sm">/</span>
              <label className="flex items-center gap-1 cursor-pointer">
                <span className="text-sm italic font-bold">Not correct</span>
                <input
                  type="checkbox"
                  checked={formData.isInformationCorrect === "not_correct"}
                  disabled={!isEnabled("isInformationCorrect")}
                  onChange={() =>
                    handleInputChange("isInformationCorrect", "not_correct")
                  }
                  className="w-5 h-5 border border-black"
                />
              </label>
            </div>

            {/* I therefore recommend... */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm">I therefore, recommend</span>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.recommendation === "recommend"}
                  disabled={!isEnabled("recommendation")}
                  onChange={() =>
                    handleInputChange("recommendation", "recommend")
                  }
                  className="w-5 h-5 border border-black"
                />
              </label>
              <span className="text-sm">/ do not recommend</span>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.recommendation === "do_not_recommend"}
                  disabled={!isEnabled("recommendation")}
                  onChange={() =>
                    handleInputChange("recommendation", "do_not_recommend")
                  }
                  className="w-5 h-5 border border-black"
                />
              </label>
              <span className="text-sm">issuance.</span>
            </div>

            {/* Name, Signature, Date */}
            <div className="flex flex-col md:flex-row gap-4 mt-2">
              <div className="flex items-center flex-1">
                <span className="text-sm mr-2">Name:</span>
                <input
                  type="text"
                  value={formData.officialName ?? ""}
                  disabled={!isEnabled("officialName")}
                  onChange={(e) =>
                    handleInputChange("officialName", e.target.value)
                  }
                  className="flex-1 border-b border-gray-400 bg-transparent focus:outline-none h-6 text-sm"
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 mt-1">
              <div className="flex items-center flex-1">
                <span className="text-sm mr-2">Signature:</span>
                <div className="flex-1 border-b border-gray-400 h-6"></div>
              </div>
              <div className="flex items-center flex-1">
                <span className="text-sm mr-2">Date:</span>
                <input
                  type="date"
                  value={formData.officialDate ?? ""}
                  disabled={!isEnabled("officialDate")}
                  onChange={(e) =>
                    handleInputChange("officialDate", e.target.value)
                  }
                  className="flex-1 border-b border-gray-400 bg-transparent focus:outline-none h-6 text-sm"
                />
              </div>
            </div>

            {/* Registrar Endorsement */}
            <div className="mt-6 pt-4 border-t border-gray-300">
              <p className="text-sm font-serif italic mb-4">
                Registrar: I endorse the recommendation
              </p>

              <div className="flex justify-end pr-8">
                <div className="text-center">
                  <div className="w-48 border-t border-black mb-1"></div>
                  <p className="text-sm font-bold">Deputy Registrar (PAD)</p>
                </div>
              </div>
            </div>

            {/* Approved By Registrar */}
            <div className="mt-4 flex flex-col md:flex-row gap-8 items-end">
              <div className="flex-1 flex items-end">
                <span className="text-sm font-bold mr-2">
                  Approved by Registrar:
                </span>
                <div className="flex-1 border-b border-black h-6"></div>
              </div>
              <div className="w-40 flex items-end">
                <span className="text-sm font-bold mr-2">Date:</span>
                <input
                  type="date"
                  value={formData.registrarDate ?? ""}
                  disabled={!isEnabled("registrarDate")}
                  onChange={(e) =>
                    handleInputChange("registrarDate", e.target.value)
                  }
                  className="flex-1 border-b border-black bg-transparent focus:outline-none h-6 text-sm"
                />
              </div>
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

        {/* Signers row */}
        {showApprovers && (
          <div className="mt-4 flex flex-wrap gap-6 border-t pt-4">
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
                label="Applicant"
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

export default StaffIdCardDataForm;
