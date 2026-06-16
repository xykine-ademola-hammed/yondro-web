import React, { useEffect, useRef, useState, type RefObject } from "react";
import { useAuth } from "../../GlobalContexts/AuthContext";
import moment from "moment";
import useDownloadPdf from "../../common/hooks/useDownloadPdf";
import Signer from "../../components/Signer";
import { getFinanceCode } from "../../common/methods";
import spedLogo from "../../resources/spedLogo.png";
import FormActions from "./FormActions";
import { isShowOrganizationDetail } from "../../common/constant";
import type { Approver } from "./ClaimOutOfPocketExpenses";

interface Requestor {
  firstName?: string;
  lastName?: string;
  date?: string;
  department?: string;
  position?: string;
}

interface EmployeeDisengagementFormStruct {
  date: string;
  fileNo?: string;

  // Section A
  staffName?: string;
  department?: string;
  disengagementDate?: string;

  // Section C
  registrarAuthName?: string;
  registrarAuthDate?: string;

  requestorDeligation?: string;
  requestor?: Requestor;
  approvers?: Approver[];
  attachments?: any[];
  [key: string]: any;
}

interface EmployeeDisengagementFormProps {
  loading: boolean;
  setLoading: (value: boolean) => void;
  formResponses: Partial<EmployeeDisengagementFormStruct>;
  enableInputList?: string[];
  triggerVoucherCreation?: boolean;
  vissibleSections?: string[];
  onSubmit: (data: EmployeeDisengagementFormStruct, status: string) => void;
  onCancel: () => void;
  showActionButtons?: boolean;
  mode?: "edit" | "preview" | "new" | "in_progress";
  responseTypes: string[];
  showApprovers?: boolean;
  showAddDocument?: boolean;
}

const ALWAYS_REQUIRED: (keyof EmployeeDisengagementFormStruct)[] = [
  "date",
  "requestorDeligation",
];

const UI_REQUIRED: (keyof EmployeeDisengagementFormStruct)[] = [
  "staffName",
  "department",
  "disengagementDate",
];

const CLEARANCE_OFFICERS = [
  { key: "storeOfficer", label: "Store Officer" },
  { key: "headSalariesWages", label: "Head (Salaries & Wages)" },
  { key: "bursar", label: "Bursar" },
  { key: "collegeLibrarian", label: "College Librarian" },
  { key: "dean", label: "Dean (Where applicable)" },
  { key: "headDeptUnit", label: "Head of Department/Unit" },
  { key: "worksMaintenance", label: "Works and Maintenance" },
  { key: "loansAdvances", label: "Loans & Advances: (Where applicable)" },
  { key: "treasurerCoop", label: "Treasurer (Staff Cooperative Society)" },
  { key: "treasurerCoeasu", label: "Treasurer (COEASU) for COEASU/Bank Loan" },
  {
    key: "treasurerSsucoen",
    label: "Treasurer (SSUCOEN) for SSUCOEN/Bank Loan",
  },
  { key: "treasurerNasu", label: "Treasurer (NASU) for NASU/Bank Loan" },
  {
    key: "treasurerAonnulah",
    label: "Treasurer (AONNULAH Contribution Society)",
  },
  {
    key: "treasurerAgape",
    label: "Treasurer (AGAPE LOVE Contribution Society)",
  },
  {
    key: "personnelAffairsId",
    label: "Personnel Affairs Division (Withdrawal of I.D. Card)",
  },
  { key: "chairmanTetfund", label: "Chairman (TETFund Committee)" },
  {
    key: "chairmanAcademicWelfare",
    label: "Chairman (Academic Staff Welfare Scheme)",
  },
];

const EmployeeDisengagementForm: React.FC<EmployeeDisengagementFormProps> = ({
  formResponses,
  enableInputList = [""],
  onSubmit,
  onCancel,
  showActionButtons = false,
  mode = "new",
  responseTypes = [""],
  loading = false,
  setLoading,
  //   showApprovers = true,
  //   showAddDocument = true,
}) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const downloadPdf = useDownloadPdf();
  const { user } = useAuth();

  const [errors, setErrors] = useState<Record<string, string>>({});
  console.log(errors);
  const [hasErrors, setHasErrors] = useState<boolean>(false);

  const [formData, setFormData] = useState<EmployeeDisengagementFormStruct>({
    date: moment(new Date()).format("YYYY-MM-DD"),
    requestorDeligation: getFinanceCode(user),
    ...formResponses,
  });

  const handleInputChange = (
    fieldId: keyof EmployeeDisengagementFormStruct,
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

  // Helper to check if a specific signer is enabled/required
  // We'll rely on the parent configuration for required fields generally,
  // but for local UI validation we check basic fields.
  const getRequiredFields = (): (keyof EmployeeDisengagementFormStruct)[] => {
    const required: (keyof EmployeeDisengagementFormStruct)[] = [
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
          staffName: "Staff Name",
          department: "Department",
          disengagementDate: "Date of Disengagement",
          date: "Date",
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

  //   const inputClass = (
  //     field: keyof EmployeeDisengagementFormStruct,
  //     also = "",
  //   ) =>
  //     `w-full p-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
  //       errors[field as string] ? "border-red-500" : "border-gray-300"
  //     } ${also}`;

  // Helper to find approver data for a specific key
  // The 'approvers' array usually comes from backend with user details.
  // We match based on some logic or position if mapped, but here we just list them.
  // In this generic form structure, we often rely on the 'approvers' prop to strictly render
  // who has signed. But the image implies fixed slots.
  // We will seek an approver in formData.approvers that matches the position or label?
  // Actually, usually the backend workflows populate 'approvers'.
  // We will render placeholders if not present, or the signed data if present.
  const getApprover = (label: string) => {
    // Logic: find approver whose label loosely matches or if we decided to map keys to workflow steps.
    // For now, simple finding by label or just rendering the slot for the system to fill
    return formData.approvers?.find((a) => a.label === label);
  };

  return (
    <div>
      <div className="flex justify-end items-end no-print">
        <button
          className="px-2 py-1 bg-blue-900 text-white rounded"
          onClick={() =>
            downloadPdf(componentRef as RefObject<HTMLElement>, {
              fileName: "disengagement-clearance-form.pdf",
              orientation: "portrait",
              format: "a4",
              margin: 10,
              scale: 1,
              hideSelectors: [".no-print"],
              onBeforeCapture: () => {
                // Hack to ensure all borders render well?
              },
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
          {/* Photo Box */}
          <div className="border border-gray-400 w-24 h-28 flex items-center justify-center text-center p-1 bg-gray-50 rounded-lg">
            <span className="text-[10px] text-gray-500">
              Affix your Photograph Here
            </span>
          </div>

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

            <h1 className="text-xl font-black uppercase mt-4 text-gray-800 tracking-wide">
              EMPLOYEE FINAL DISENGAGEMENT CLEARANCE FORM
            </h1>

            <div className="flex justify-between text-xs mt-4 font-bold border-t border-gray-300 pt-1">
              <div className="flex gap-1 items-end">
                <span>FILE NO.:</span>
                <input
                  type="text"
                  value={formData.fileNo ?? ""}
                  disabled={!isEnabled("fileNo")}
                  onChange={(e) => handleInputChange("fileNo", e.target.value)}
                  className="border-b border-black w-32 focus:outline-none h-4 bg-transparent"
                />
              </div>
              <span className="self-end">PAD/EFDC/FORM</span>
            </div>
          </div>
        </div>

        {hasErrors && (
          <div className="bg-red-50 p-2 rounded-lg mb-2 no-print">
            <p className="text-red-800 text-sm">Please fix the errors below.</p>
          </div>
        )}

        {/* Section A */}
        <div className="mb-4">
          <h4 className="font-bold text-sm bg-gray-200 p-1 mb-2">
            Section A: (Full name of the staff – Surname First)
          </h4>
          <div className="text-sm leading-8 text-justify">
            This is to confirm that Dr./Mr./Mrs./Miss
            <input
              type="text"
              value={formData.staffName ?? ""}
              disabled={!isEnabled("staffName")}
              onChange={(e) => handleInputChange("staffName", e.target.value)}
              className="border-b border-dotted border-black px-1 w-64 h-6 py-0 focus:outline-none bg-transparent"
              placeholder="Surname First"
            />
            of
            <input
              type="text"
              value={formData.department ?? ""}
              disabled={!isEnabled("department")}
              onChange={(e) => handleInputChange("department", e.target.value)}
              className="border-b border-dotted border-black px-1 w-64 h-6 py-0  focus:outline-none bg-transparent"
              placeholder="Department"
            />
            Department who is disengaging from the service of the College on
            <input
              type="date"
              value={formData.disengagementDate ?? ""}
              disabled={!isEnabled("disengagementDate")}
              onChange={(e) =>
                handleInputChange("disengagementDate", e.target.value)
              }
              className="border-b border-dotted border-black px-1 w-40 h-6 py-0 focus:outline-none bg-transparent"
            />
            has completed official assignments and/or handed over as
            appropriate. He/She has also accounted to every Government property
            in his/her care and has checked out of Government quarters. He/She
            is therefore recommended for his/her{" "}
            <span className="font-bold">Last Pay Certificate</span> (when
            required) and{" "}
            <span className="font-bold">Letter of Final Release</span>.
          </div>
        </div>

        {/* Section B */}
        <div className="mb-4">
          <h4 className="font-bold text-sm bg-gray-200 p-1 mb-2">
            Section B: (Name, Signature and Date of:)
          </h4>
          <div className="space-y-4 pl-2">
            {CLEARANCE_OFFICERS.map((officer, index) => {
              const approver = getApprover(officer.label);
              // Match either by strict label or by index if we were using index-based mapping

              return (
                <div
                  key={officer.key}
                  className="flex flex-col md:flex-row md:items-center border-b border-gray-100 pb-2"
                >
                  <div className="w-10 font-bold text-sm">{index + 1}</div>
                  <div className="w-64 text-sm font-semibold">
                    {officer.label}:
                  </div>
                  <div className="flex-1 mt-2 md:mt-0">
                    {/* If we show approvers (interactive mode usually renders Signer for relevant user) 
                                    But here we want to show the 'lines' if empty or the Signature if present. 
                                    The 'Signer' component usually requires a user object. 
                                    For strict visual replication of the blank form, we'd use lines. 
                                    For the app, we likely want the digital signature slot.
                                */}
                    {approver ? (
                      <Signer
                        firstName={approver.firstName}
                        lastName={approver.lastName}
                        department={approver.department}
                        position={approver.position}
                        label={approver.label} // Changed label to officer.label for accuracy
                        date={approver.date}
                        // compact mode?
                      />
                    ) : (
                      // Placeholder lines for PDF printout or empty state
                      <div className="border-b border-dotted border-gray-400 h-8 w-full"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section C */}
        <div className="mb-4 mt-6">
          <h4 className="font-bold text-sm bg-gray-200 p-1 mb-2">
            Section C: (Authority to release by the Registrar)
          </h4>
          <div className="text-sm leading-8 mt-4">
            I,
            <input
              type="text"
              placeholder="(Full Name)"
              value={formData.registrarAuthName ?? ""}
              disabled={!isEnabled("registrarAuthName")}
              onChange={(e) =>
                handleInputChange("registrarAuthName", e.target.value)
              }
              className="border-b border-dotted border-black px-1 w-64 h-6 py-0 focus:outline-none bg-transparent"
            />
            hereby authorized the release of the above named staff for final
            disengagement.
          </div>
        </div>

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

export default EmployeeDisengagementForm;
