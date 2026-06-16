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

interface NextOfKinDetail {
  name?: string;
  address?: string;
  relationship?: string;
}

interface ChangeOfNextOfKinFormStruct {
  date: string;
  fileNo?: string;

  // Personal Details
  fullName?: string;
  dateFirstAppointment?: string;
  department?: string;
  designation?: string;

  // Next of Kin
  previousNextOfKin1?: NextOfKinDetail;
  previousNextOfKin2?: NextOfKinDetail;
  newNextOfKin1?: NextOfKinDetail;
  newNextOfKin2?: NextOfKinDetail;

  // Personnel Authentication
  authName?: string;
  authRank?: string;
  authDate?: string;

  requestorDeligation?: string;
  requestor?: Requestor;
  approvers?: any[];
  [key: string]: any;
}

interface ChangeOfNextOfKinFormProps {
  loading: boolean;
  setLoading: (value: boolean) => void;
  formResponses: Partial<ChangeOfNextOfKinFormStruct>;
  enableInputList?: string[];
  triggerVoucherCreation?: boolean;
  vissibleSections?: string[];
  onSubmit: (data: ChangeOfNextOfKinFormStruct, status: string) => void;
  onCancel: () => void;
  showActionButtons?: boolean;
  mode?: "edit" | "preview" | "new" | "in_progress";
  responseTypes: string[];
  showApprovers?: boolean;
  showAddDocument?: boolean;
}

const ALWAYS_REQUIRED: (keyof ChangeOfNextOfKinFormStruct)[] = [
  "date",
  "requestorDeligation",
];

const UI_REQUIRED: (keyof ChangeOfNextOfKinFormStruct)[] = [
  "fullName",
  "department",
  "designation",
];

const ChangeOfNextOfKinForm: React.FC<ChangeOfNextOfKinFormProps> = ({
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

  const [errors, setErrors] = useState<Record<string, string>>({});
  console.log(errors);
  const [hasErrors, setHasErrors] = useState<boolean>(false);

  const [formData, setFormData] = useState<ChangeOfNextOfKinFormStruct>({
    date: moment(new Date()).format("YYYY-MM-DD"),
    requestorDeligation: getFinanceCode(user),
    previousNextOfKin1: {},
    previousNextOfKin2: {},
    newNextOfKin1: {},
    newNextOfKin2: {},
    ...formResponses,
  });

  const handleInputChange = (
    fieldId: keyof ChangeOfNextOfKinFormStruct,
    value: any,
  ) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[fieldId as string];
      return next;
    });
  };

  const handleNestedChange = (
    section:
      | "previousNextOfKin1"
      | "previousNextOfKin2"
      | "newNextOfKin1"
      | "newNextOfKin2",
    field: keyof NextOfKinDetail,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      ...formResponses,
    }));
  }, [formResponses]);

  const isEnabled = (name: string) => enableInputList.includes(name);

  const getRequiredFields = (): (keyof ChangeOfNextOfKinFormStruct)[] => {
    const required: (keyof ChangeOfNextOfKinFormStruct)[] = [
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
          fullName: "Full Name",
          department: "Department",
          designation: "Designation",
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
              fileName: "change-of-next-of-kin-form.pdf",
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
        <div className="text-center mb-6 border-b-2 border-black pb-4">
          {isShowOrganizationDetail && (
            <img
              src={spedLogo}
              alt="Logo"
              className="h-12 w-auto mx-auto mb-2"
            />
          )}
          <h2 className="text-lg font-extrabold uppercase text-gray-800">
            {isShowOrganizationDetail
              ? user?.organization?.name
              : "FEDERAL COLLEGE OF EDUCATION (SPECIAL), OYO"}
          </h2>
          <h3 className="text-md font-bold italic text-gray-600 font-serif">
            REGISTRY DEPARTMENT
          </h3>
          <h3 className="text-md font-bold italic text-gray-600 font-serif">
            PERSONNEL AFFAIRS UNIT
          </h3>

          <h1 className="text-lg font-bold uppercase mt-6 text-gray-700 tracking-wide">
            REQUEST FORM FOR CHANGE OF NEXT OF KIN
          </h1>
          <p className="text-sm italic">(To be completed by the applicant)</p>
        </div>

        {hasErrors && (
          <div className="bg-red-50 p-2 rounded-lg mb-2 no-print">
            <p className="text-red-800 text-sm">Please fix the errors below.</p>
          </div>
        )}

        {/* Personal Info */}
        <div className="mb-6 space-y-4 text-sm font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-6">1.</span>
            <label className="w-32">FULL NAME:</label>
            <input
              type="text"
              value={formData.fullName ?? ""}
              disabled={!isEnabled("fullName")}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              className="border-b border-gray-400 flex-1 focus:outline-none bg-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6">2.</span>
            <label className="w-32">FILE NO.:</label>
            <input
              type="text"
              value={formData.fileNo ?? ""}
              disabled={!isEnabled("fileNo")}
              onChange={(e) => handleInputChange("fileNo", e.target.value)}
              className="border-b border-gray-400 flex-1 focus:outline-none bg-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6">3.</span>
            <label className="w-64">DATE OF FIRST APPOINTMENT:</label>
            <input
              type="date"
              value={formData.dateFirstAppointment ?? ""}
              disabled={!isEnabled("dateFirstAppointment")}
              onChange={(e) =>
                handleInputChange("dateFirstAppointment", e.target.value)
              }
              className="border-b border-gray-400 flex-1 focus:outline-none bg-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6">4.</span>
            <label className="w-32">DEPARTMENT:</label>
            <input
              type="text"
              value={formData.department ?? ""}
              disabled={!isEnabled("department")}
              onChange={(e) => handleInputChange("department", e.target.value)}
              className="border-b border-gray-400 flex-1 focus:outline-none bg-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6">5.</span>
            <label className="w-32">DESIGNATION:</label>
            <input
              type="text"
              value={formData.designation ?? ""}
              disabled={!isEnabled("designation")}
              onChange={(e) => handleInputChange("designation", e.target.value)}
              className="border-b border-gray-400 flex-1 focus:outline-none bg-transparent"
            />
          </div>
        </div>

        <div className="my-4 border-t border-gray-300"></div>

        {/* Particulars of Next of Kin */}
        <div className="mb-6 text-sm font-semibold">
          <div className="flex gap-2 font-bold mb-4">
            <span>6.</span>
            <span className="uppercase">PARTICULARS OF NEXT OF KIN:</span>
          </div>

          {/* (a) Previous */}
          <div className="pl-6 mb-6">
            <div className="mb-2">
              (a) <span className="uppercase ml-4">PREVIOUS NEXT OF KIN:</span>
            </div>

            {/* 1 */}
            <div className="pl-8 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span>(1)</span>
                <label className="w-24">NAME:</label>
                <input
                  type="text"
                  value={formData.previousNextOfKin1?.name ?? ""}
                  disabled={!isEnabled("previousNextOfKin1")}
                  onChange={(e) =>
                    handleNestedChange(
                      "previousNextOfKin1",
                      "name",
                      e.target.value,
                    )
                  }
                  className="border-b border-gray-400 flex-1 focus:outline-none bg-transparent"
                />
              </div>
              <div className="flex items-center gap-2 mb-2 ml-6">
                <label className="w-24">ADDRESS:</label>
                <input
                  type="text"
                  value={formData.previousNextOfKin1?.address ?? ""}
                  disabled={!isEnabled("previousNextOfKin1")}
                  onChange={(e) =>
                    handleNestedChange(
                      "previousNextOfKin1",
                      "address",
                      e.target.value,
                    )
                  }
                  className="border-b border-gray-400 flex-1 focus:outline-none bg-transparent"
                />
              </div>
              <div className="flex items-center gap-2 mb-2 ml-6">
                <label className="w-28">RELATIONSHIP:</label>
                <input
                  type="text"
                  value={formData.previousNextOfKin1?.relationship ?? ""}
                  disabled={!isEnabled("previousNextOfKin1")}
                  onChange={(e) =>
                    handleNestedChange(
                      "previousNextOfKin1",
                      "relationship",
                      e.target.value,
                    )
                  }
                  className="border-b border-gray-400 flex-1 focus:outline-none bg-transparent"
                />
              </div>
            </div>

            {/* 2 */}
            <div className="pl-8">
              <div className="flex items-center gap-2 mb-2">
                <span>(2)</span>
                <label className="w-24">NAME:</label>
                <input
                  type="text"
                  value={formData.previousNextOfKin2?.name ?? ""}
                  disabled={!isEnabled("previousNextOfKin2")}
                  onChange={(e) =>
                    handleNestedChange(
                      "previousNextOfKin2",
                      "name",
                      e.target.value,
                    )
                  }
                  className="border-b border-gray-400 flex-1 focus:outline-none bg-transparent"
                />
              </div>
              <div className="flex items-center gap-2 mb-2 ml-6">
                <label className="w-24">ADDRESS:</label>
                <input
                  type="text"
                  value={formData.previousNextOfKin2?.address ?? ""}
                  disabled={!isEnabled("previousNextOfKin2")}
                  onChange={(e) =>
                    handleNestedChange(
                      "previousNextOfKin2",
                      "address",
                      e.target.value,
                    )
                  }
                  className="border-b border-gray-400 flex-1 focus:outline-none bg-transparent"
                />
              </div>
              <div className="flex items-center gap-2 mb-2 ml-6">
                <label className="w-28">RELATIONSHIP:</label>
                <input
                  type="text"
                  value={formData.previousNextOfKin2?.relationship ?? ""}
                  disabled={!isEnabled("previousNextOfKin2")}
                  onChange={(e) =>
                    handleNestedChange(
                      "previousNextOfKin2",
                      "relationship",
                      e.target.value,
                    )
                  }
                  className="border-b border-gray-400 flex-1 focus:outline-none bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* (b) New */}
          <div className="pl-6 mb-6">
            <div className="mb-2">
              (b){" "}
              <span className="uppercase ml-4">NEW INTENDED NEXT OF KIN:</span>
            </div>

            {/* 1 */}
            <div className="pl-8 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span>(1)</span>
                <label className="w-24">NAME:</label>
                <input
                  type="text"
                  value={formData.newNextOfKin1?.name ?? ""}
                  disabled={!isEnabled("newNextOfKin1")}
                  onChange={(e) =>
                    handleNestedChange("newNextOfKin1", "name", e.target.value)
                  }
                  className="border-b border-gray-400 flex-1 focus:outline-none bg-transparent"
                />
              </div>
              <div className="flex items-center gap-2 mb-2 ml-6">
                <label className="w-24">ADDRESS:</label>
                <input
                  type="text"
                  value={formData.newNextOfKin1?.address ?? ""}
                  disabled={!isEnabled("newNextOfKin1")}
                  onChange={(e) =>
                    handleNestedChange(
                      "newNextOfKin1",
                      "address",
                      e.target.value,
                    )
                  }
                  className="border-b border-gray-400 flex-1 focus:outline-none bg-transparent"
                />
              </div>
              <div className="flex items-center gap-2 mb-2 ml-6">
                <label className="w-28">RELATIONSHIP:</label>
                <input
                  type="text"
                  value={formData.newNextOfKin1?.relationship ?? ""}
                  disabled={!isEnabled("newNextOfKin1")}
                  onChange={(e) =>
                    handleNestedChange(
                      "newNextOfKin1",
                      "relationship",
                      e.target.value,
                    )
                  }
                  className="border-b border-gray-400 flex-1 focus:outline-none bg-transparent"
                />
              </div>
            </div>

            {/* 2 */}
            <div className="pl-8">
              <div className="flex items-center gap-2 mb-2">
                <span>(2)</span>
                <label className="w-24">NAME:</label>
                <input
                  type="text"
                  value={formData.newNextOfKin2?.name ?? ""}
                  disabled={!isEnabled("newNextOfKin2")}
                  onChange={(e) =>
                    handleNestedChange("newNextOfKin2", "name", e.target.value)
                  }
                  className="border-b border-gray-400 flex-1 focus:outline-none bg-transparent"
                />
              </div>
              <div className="flex items-center gap-2 mb-2 ml-6">
                <label className="w-24">ADDRESS:</label>
                <input
                  type="text"
                  value={formData.newNextOfKin2?.address ?? ""}
                  disabled={!isEnabled("newNextOfKin2")}
                  onChange={(e) =>
                    handleNestedChange(
                      "newNextOfKin2",
                      "address",
                      e.target.value,
                    )
                  }
                  className="border-b border-gray-400 flex-1 focus:outline-none bg-transparent"
                />
              </div>
              <div className="flex items-center gap-2 mb-2 ml-6">
                <label className="w-28">RELATIONSHIP:</label>
                <input
                  type="text"
                  value={formData.newNextOfKin2?.relationship ?? ""}
                  disabled={!isEnabled("newNextOfKin2")}
                  onChange={(e) =>
                    handleNestedChange(
                      "newNextOfKin2",
                      "relationship",
                      e.target.value,
                    )
                  }
                  className="border-b border-gray-400 flex-1 focus:outline-none bg-transparent"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 italic text-center">
            I certify the above information to be true and correct.
          </div>

          <div className="flex justify-between items-end mt-8 px-4">
            <div className="w-5/12 border-t border-black text-center pt-1 font-bold">
              SIGNATURE
            </div>
            <div className="w-4/12 border-t border-black text-center pt-1 font-bold">
              DATE
            </div>
          </div>

          <div className="mt-8 pt-4 border-t-2 border-black">
            <h4 className="text-center font-bold mb-4 text-gray-600">
              (PERSONNEL AUTHENTICATION)
            </h4>
            <div className="pl-8 space-y-4">
              <div>
                <span className="uppercase">Change Authenticated By:</span>
              </div>
              <div className="flex items-center gap-2">
                <span>(i)</span>
                <label className="w-16">NAME:</label>
                <input
                  type="text"
                  value={formData.authName ?? ""}
                  disabled={!isEnabled("authName")}
                  onChange={(e) =>
                    handleInputChange("authName", e.target.value)
                  }
                  className="border-b border-gray-400 flex-1 focus:outline-none bg-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <span>(ii)</span>
                <label className="w-16">RANK:</label>
                <input
                  type="text"
                  value={formData.authRank ?? ""}
                  disabled={!isEnabled("authRank")}
                  onChange={(e) =>
                    handleInputChange("authRank", e.target.value)
                  }
                  className="border-b border-gray-400 flex-1 focus:outline-none bg-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <span>(iii)</span>
                <label className="w-48">SIGNATURE AND DATE:</label>
                <Signer
                  label="Approve" // The label prop is a string literal, which is a valid type. No change needed here.
                  firstName={
                    formData.approvers?.find((a) => a.label === "Approve")
                      ?.firstName
                  }
                  lastName={
                    formData.approvers?.find((a) => a.label === "Approve")
                      ?.lastName
                  }
                  date={
                    formData.approvers?.find((a) => a.label === "Approve")?.date
                  }
                  position={
                    formData.approvers?.find((a) => a.label === "Approve")
                      ?.position
                  }
                />
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

export default ChangeOfNextOfKinForm;
