import React, { useEffect, useRef, useState, type RefObject } from "react";
import { useAuth } from "../../GlobalContexts/AuthContext";
import moment from "moment";
import useDownloadPdf from "../../common/hooks/useDownloadPdf";
import Signer from "../../components/Signer";
import { getFinanceCode } from "../../common/methods";
import FormActions from "./FormActions";
import { isShowOrganizationDetail } from "../../common/constant";
import spedLogo from "../../resources/spedLogo.png";

interface Requestor {
  firstName?: string;
  lastName?: string;
  date?: string;
  department?: string;
  position?: string;
}

interface PromotionInterestFormStruct {
  date: string;
  fileNo?: string;

  // Section A: Staff Personal Information
  surname?: string;
  otherNames?: string;
  schoolDepartment?: string;
  divisionUnit?: string;
  presentAppointment?: string;
  presentSalaryLevel?: string;
  presentSalaryStep?: string;
  dateOfPresentAppointment?: string;
  dateOfConfirmation?: string;
  nextRankDesired?: string;
  gsmNo?: string;

  // Section B: Endorsement by HOD/HOU
  hodName?: string;
  hodComments?: string;

  // Personnel Affairs Division Use Only
  isDueForPromotion?: boolean; // true = Due, false = Not Due
  isRecommendationReceived?: boolean; // true = Received, false = Not Received
  checkedBy?: string;
  checkedDate?: string;

  requestorDeligation?: string;
  requestor?: Requestor;
  approvers?: any[]; // Using generic any primarily for Signer interaction if needed
  [key: string]: any;
}

interface PromotionInterestFormProps {
  loading: boolean;
  setLoading: (value: boolean) => void;
  formResponses: Partial<PromotionInterestFormStruct>;
  enableInputList?: string[];
  triggerVoucherCreation?: boolean;
  vissibleSections?: string[];
  onSubmit: (data: PromotionInterestFormStruct, status: string) => void;
  onCancel: () => void;
  showActionButtons?: boolean;
  mode?: "edit" | "preview" | "new" | "in_progress";
  responseTypes: string[];
  showApprovers?: boolean;
  showAddDocument?: boolean;
}

const ALWAYS_REQUIRED: (keyof PromotionInterestFormStruct)[] = [
  "date",
  "requestorDeligation",
];

const UI_REQUIRED: (keyof PromotionInterestFormStruct)[] = [
  "surname",
  "schoolDepartment",
  "presentAppointment",
];

const PromotionInterestForm: React.FC<PromotionInterestFormProps> = ({
  formResponses,
  enableInputList = [""],
  onSubmit,
  onCancel,
  showActionButtons = false,
  mode = "new",
  responseTypes = [""],
  loading = false,
  setLoading,
}) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const downloadPdf = useDownloadPdf();
  const { user } = useAuth();

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [errors, setErrors] = useState<Record<string, string>>({});
  console.log(errors);
  /* eslint-enable @typescript-eslint/no-unused-vars */
  const [hasErrors, setHasErrors] = useState<boolean>(false);

  const [formData, setFormData] = useState<PromotionInterestFormStruct>({
    date: moment(new Date()).format("YYYY-MM-DD"),
    requestorDeligation: getFinanceCode(user),
    ...formResponses,
  });

  const handleInputChange = (
    fieldId: keyof PromotionInterestFormStruct,
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

  const getRequiredFields = (): (keyof PromotionInterestFormStruct)[] => {
    const required: (keyof PromotionInterestFormStruct)[] = [
      ...ALWAYS_REQUIRED,
    ];
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
          surname: "Surname",
          schoolDepartment: "School/Department",
          presentAppointment: "Present Appointment",
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

  return (
    <div>
      <div className="flex justify-end items-end no-print">
        <button
          className="px-2 py-1 bg-blue-900 text-white rounded"
          onClick={() =>
            downloadPdf(componentRef as RefObject<HTMLElement>, {
              fileName: "promotion-interest-form.pdf",
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
        className="bg-white rounded-lg sm:p-8 w-full max-w-4xl border-2 border-gray-300 p-4"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-2">
            {isShowOrganizationDetail && (
              <img src={spedLogo} alt="Logo" className="h-16 w-auto mr-4" />
            )}
            <div>
              <h2 className="text-lg font-extrabold uppercase text-gray-800">
                {isShowOrganizationDetail
                  ? user?.organization?.name
                  : "FEDERAL COLLEGE OF EDUCATION (SPECIAL), OYO"}
              </h2>
              <h3 className="text-md font-bold text-gray-600">
                REGISTRY DEPARTMENT
              </h3>
              <h3 className="text-md font-bold text-gray-600">
                (PERSONNEL AFFAIRS DIVISION)
              </h3>
            </div>
          </div>

          <h1 className="text-xl font-black uppercase mt-4 text-gray-600 tracking-wide">
            PROMOTION EXPRESSION OF INTEREST FORM
          </h1>
        </div>

        {hasErrors && (
          <div className="bg-red-50 p-2 rounded-lg mb-2 no-print">
            <p className="text-red-800 text-sm">Please fix the errors below.</p>
          </div>
        )}

        {/* Section A */}
        <div className="mb-6">
          <div className="flex items-start gap-4 mb-4">
            <span className="font-bold text-md">A:</span>
            <span className="font-bold text-md uppercase">
              STAFF PERSONAL INFORMATION
            </span>
          </div>

          <div className="space-y-4 pl-8 text-sm font-semibold">
            <div className="flex items-center gap-2">
              <label className="w-32">NAME IN FULL:</label>
              <div className="flex-1 flex gap-4">
                <div className="flex flex-col items-center flex-1">
                  <input
                    type="text"
                    value={formData.surname ?? ""}
                    disabled={!isEnabled("surname")}
                    onChange={(e) =>
                      handleInputChange("surname", e.target.value)
                    }
                    className="border-b border-dotted border-black w-full focus:outline-none bg-transparent"
                  />
                  <span className="text-xs font-normal">(Surname)</span>
                </div>
                <div className="flex flex-col items-center flex-1">
                  <input
                    type="text"
                    value={formData.otherNames ?? ""}
                    disabled={!isEnabled("otherNames")}
                    onChange={(e) =>
                      handleInputChange("otherNames", e.target.value)
                    }
                    className="border-b border-dotted border-black w-full focus:outline-none bg-transparent"
                  />
                  <span className="text-xs font-normal">(Other Names)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="w-32">FILE NO.:</label>
              <input
                type="text"
                value={formData.fileNo ?? ""}
                disabled={!isEnabled("fileNo")}
                onChange={(e) => handleInputChange("fileNo", e.target.value)}
                className="border-b border-dotted border-black flex-1 focus:outline-none bg-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="w-48">SCHOOL/DEPARTMENT:</label>
              <input
                type="text"
                value={formData.schoolDepartment ?? ""}
                disabled={!isEnabled("schoolDepartment")}
                onChange={(e) =>
                  handleInputChange("schoolDepartment", e.target.value)
                }
                className="border-b border-dotted border-black flex-1 focus:outline-none bg-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="w-48">DIVISION/UNIT:</label>
              <input
                type="text"
                value={formData.divisionUnit ?? ""}
                disabled={!isEnabled("divisionUnit")}
                onChange={(e) =>
                  handleInputChange("divisionUnit", e.target.value)
                }
                className="border-b border-dotted border-black flex-1 focus:outline-none bg-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="w-56">PRESENT APPOINTMENT:</label>
              <input
                type="text"
                value={formData.presentAppointment ?? ""}
                disabled={!isEnabled("presentAppointment")}
                onChange={(e) =>
                  handleInputChange("presentAppointment", e.target.value)
                }
                className="border-b border-dotted border-black flex-1 focus:outline-none bg-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="w-48">PRESENT SALARY: LEVEL</label>
              <input
                type="text"
                value={formData.presentSalaryLevel ?? ""}
                disabled={!isEnabled("presentSalaryLevel")}
                onChange={(e) =>
                  handleInputChange("presentSalaryLevel", e.target.value)
                }
                className="border-b border-dotted border-black w-24 focus:outline-none bg-transparent"
              />
              <label className="ml-4">STEP</label>
              <input
                type="text"
                value={formData.presentSalaryStep ?? ""}
                disabled={!isEnabled("presentSalaryStep")}
                onChange={(e) =>
                  handleInputChange("presentSalaryStep", e.target.value)
                }
                className="border-b border-dotted border-black flex-1 focus:outline-none bg-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="w-64">DATE OF PRESENT APPOINTMENT:</label>
              <input
                type="date"
                value={formData.dateOfPresentAppointment ?? ""}
                disabled={!isEnabled("dateOfPresentAppointment")}
                onChange={(e) =>
                  handleInputChange("dateOfPresentAppointment", e.target.value)
                }
                className="border-b border-dotted border-black flex-1 focus:outline-none bg-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="w-72">
                DATE OF CONFIRMATION OF APPOINTMENT:
              </label>
              <input
                type="date"
                value={formData.dateOfConfirmation ?? ""}
                disabled={!isEnabled("dateOfConfirmation")}
                onChange={(e) =>
                  handleInputChange("dateOfConfirmation", e.target.value)
                }
                className="border-b border-dotted border-black flex-1 focus:outline-none bg-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="w-48">NEXT RANK DESIRED:</label>
              <input
                type="text"
                value={formData.nextRankDesired ?? ""}
                disabled={!isEnabled("nextRankDesired")}
                onChange={(e) =>
                  handleInputChange("nextRankDesired", e.target.value)
                }
                className="border-b border-dotted border-black flex-1 focus:outline-none bg-transparent"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4 pt-4">
              <div className="flex items-center gap-2 flex-1">
                <label>GSM NO.:</label>
                <input
                  type="text"
                  value={formData.gsmNo ?? ""}
                  disabled={!isEnabled("gsmNo")}
                  onChange={(e) => handleInputChange("gsmNo", e.target.value)}
                  className="border-b border-dotted border-black flex-1 focus:outline-none bg-transparent"
                />
              </div>
              <div className="flex items-center gap-2 flex-1 justify-end">
                <label>SIGNATURE & DATE:</label>
                <Signer
                  firstName={formData.requestor?.firstName}
                  lastName={formData.requestor?.lastName}
                  department={formData.requestor?.department}
                  position={formData.requestor?.position}
                  label="Applicant"
                  date={formData.requestor?.date}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section B */}
        <div className="mb-6">
          <div className="flex items-start gap-4 mb-4">
            <span className="font-bold text-md">B:</span>
            <span className="font-bold text-md uppercase">
              ENDORSEMENT BY HOD/HOU/IMMEDIATE SUPERVISOR
            </span>
          </div>
          <div className="space-y-4 pl-8 text-sm font-semibold">
            <div className="flex items-center gap-2">
              <label className="w-72">
                HOD/HOU/IMMEDIATE SUPERVISOR'S NAME:
              </label>
              <input
                type="text"
                value={formData.hodName ?? ""}
                disabled={!isEnabled("hodName")}
                onChange={(e) => handleInputChange("hodName", e.target.value)}
                className="border-b border-dotted border-black flex-1 focus:outline-none bg-transparent"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label>HOD/HOU/IMMEDIATE SUPERVISOR'S COMMENTS (If Any):</label>
              <textarea
                value={formData.hodComments ?? ""}
                disabled={!isEnabled("hodComments")}
                onChange={(e) =>
                  handleInputChange("hodComments", e.target.value)
                }
                className="border border-dotted border-black w-full p-2 h-20 focus:outline-none bg-transparent resize-none"
              />
            </div>

            <div className="border border-black p-4 mt-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="font-bold uppercase text-gray-500 w-full md:w-1/2">
                  HOD/HOU/IMMEDIATE SUPERVISOR'S SIGNATURE & DATE:
                </div>
                <div className="w-full md:w-1/2">
                  <Signer
                    label="Recommend"
                    firstName={
                      formData.approvers?.find((a) => a.label === "Recommend")
                        ?.firstName
                    }
                    lastName={
                      formData.approvers?.find((a) => a.label === "Recommend")
                        ?.lastName
                    }
                    date={
                      formData.approvers?.find((a) => a.label === "Recommend")
                        ?.date
                    }
                    position={
                      formData.approvers?.find((a) => a.label === "Recommend")
                        ?.position
                    }
                  />
                </div>
              </div>
              <p className="text-xs italic mt-2 text-justify">
                <span className="font-bold">Note:</span> Head of
                Department/Unit/Immediate Supervisor to write an objective and
                performance based recommendation on the Staff and ensure that
                the recommendation reaches the Personnel Affairs Division within
                the period stipulated in the Promotion Time-Table.
              </p>
            </div>
          </div>
        </div>

        {/* Personnel Affairs Division Use Only */}
        <div className="bg-gray-50 p-4 border-t-2 border-black">
          <h4 className="font-bold text-center mb-4 uppercase">
            FOR PERSONNEL AFFAIRS DIVISION USE ONLY
          </h4>

          <div className="space-y-4 text-sm font-semibold">
            <div className="flex items-center gap-4">
              <span>1.</span>
              <span>STAFF DUE/NOT DUE FOR PROMOTION</span>
              <div className="flex gap-4 ml-4">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="isDueForPromotion"
                    checked={formData.isDueForPromotion === true}
                    disabled={!isEnabled("isDueForPromotion")}
                    onChange={() =>
                      handleInputChange("isDueForPromotion", true)
                    }
                  />
                  DUE
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="isDueForPromotion"
                    checked={formData.isDueForPromotion === false}
                    disabled={!isEnabled("isDueForPromotion")}
                    onChange={() =>
                      handleInputChange("isDueForPromotion", false)
                    }
                  />
                  NOT DUE
                </label>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span>2.</span>
              <span>
                HOD/HOU/IMMEDIATE SUPERVISOR'S RECOMMENDATION RECEIVED/NOT
                RECEIVED
              </span>
              <div className="flex gap-4 ml-4">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="isRecommendationReceived"
                    checked={formData.isRecommendationReceived === true}
                    disabled={!isEnabled("isRecommendationReceived")}
                    onChange={() =>
                      handleInputChange("isRecommendationReceived", true)
                    }
                  />
                  RECEIVED
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="isRecommendationReceived"
                    checked={formData.isRecommendationReceived === false}
                    disabled={!isEnabled("isRecommendationReceived")}
                    onChange={() =>
                      handleInputChange("isRecommendationReceived", false)
                    }
                  />
                  NOT RECEIVED
                </label>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <span>3.</span>
              <label className="w-24">CHECKED BY:</label>
              <input
                type="text"
                value={formData.checkedBy ?? ""}
                disabled={!isEnabled("checkedBy")}
                onChange={(e) => handleInputChange("checkedBy", e.target.value)}
                className="border-b border-dotted border-black flex-1 focus:outline-none bg-transparent"
              />
            </div>

            <div className="flex justify-end pt-8">
              <div className="flex flex-col items-center">
                <div className="border-t border-black w-48 pt-1"></div>
                <span className="font-bold italic text-xs">
                  Signature and Date
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
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

export default PromotionInterestForm;
