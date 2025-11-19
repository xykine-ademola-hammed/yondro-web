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
import DocumentAttachmentForm from "./DocumentAttachmentForm";
import type { Approver } from "./ClaimOutOfPocketExpenses";

interface Requestor {
  firstName?: string;
  lastName?: string;
  date?: string;
  department?: string;
  position?: string;
}

interface JobMaintenanceRequisitionForm {
  date: string;
  location?: string;
  description?: string;
  recommendationNotes?: string;
  requestorDeligation?: string;
  requestor?: Requestor;
  approvers?: Approver[];
  [key: string]: any;
}

interface JobMaintenanceRequisitionProps {
  formResponses: Partial<JobMaintenanceRequisitionForm>;
  enableInputList?: string[];
  vissibleSections?: string[];
  onSubmit: (data: JobMaintenanceRequisitionForm, status: string) => void;
  onCancel: () => void;
  showActionButtons?: boolean;
  mode?: "edit" | "preview" | "new" | "in_progress";
  responseTypes: string[];
  loading: boolean;
  setLoading: (value: boolean) => void;
}

const requiredFields = [
  "requestorDeligation",
  "date",
  "location",
  "description",
] as const;
type RequiredKey = (typeof requiredFields)[number];

const JobMaintenanceRequisition: React.FC<JobMaintenanceRequisitionProps> = ({
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

  const [hasErrors, setHasErrors] = useState<boolean>(false);
  const [errors, setErrors] = useState<Partial<Record<RequiredKey, true>>>({});

  const [formData, setFormData] = useState<JobMaintenanceRequisitionForm>({
    date: moment(new Date()).format("YYYY-MM-DD"),
    requestorDeligation: getFinanceCode(user),
    ...formResponses,
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      ...formResponses,
    }));
    // reset errors/banner when incoming data changes
    setErrors({});
    setHasErrors(false);
  }, [formResponses]);

  const isEnabled = (name: string) => enableInputList.includes(name);

  // Styling helpers: neutral border until error
  const inputClass = (name: RequiredKey | string) =>
    [
      "mt-1 w-full p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm",
      "border",
      errors[name as RequiredKey]
        ? "border-red-600 ring-1 ring-red-300"
        : "border-gray-300",
    ].join(" ");

  // Handle inputs and clear error for that field
  const handleInputChange = (
    fieldId: keyof JobMaintenanceRequisitionForm,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId as RequiredKey]) {
      setErrors((prev) => {
        const { [fieldId as RequiredKey]: _omit, ...rest } = prev;
        return rest;
      });
    }
  };

  // Validate enabled required fields only
  const validate = () => {
    const nextErrors: Partial<Record<RequiredKey, true>> = {};
    requiredFields.forEach((key) => {
      if (isEnabled(key)) {
        const val = String(formData?.[key] ?? "").trim();
        if (!val) nextErrors[key] = true;
      }
    });
    setErrors(nextErrors);
    const invalid = Object.keys(nextErrors).length > 0;
    setHasErrors(invalid);
    return !invalid;
  };

  const handleSubmit = (status: string) => {
    if (validate()) {
      setLoading(true);
      onSubmit(formData, status);
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
    setErrors({});
    setHasErrors(false);
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
              hideSelectors: ["[data-export-hide]"],
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
            <h1 className="text-xl sm:text-2xl font-semibold text-center text-gray-500">
              Job/Maintenance Requisition Form
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

        <div className="my-4">
          {/* Department/School/Unit */}
          <div className="flex flex-col md:flex-row items-start md:items-center">
            <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
              <span className="text-sm font-semibold">
                Department/School/Unit:
              </span>
            </div>
            <div className="w-full">
              <input
                type="text"
                value={formData?.requestorDeligation ?? ""}
                disabled={!isEnabled("requestorDeligation")}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("requestorDeligation", e.target.value)
                }
                className={inputClass("requestorDeligation")}
              />
            </div>
          </div>

          {/* LOCATION & DATE */}
          <div className="my-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                  <span className="text-sm font-semibold">Location:</span>
                </div>
                <div className="w-full">
                  <input
                    type="text"
                    value={formData?.location ?? ""}
                    disabled={!isEnabled("location")}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("location", e.target.value)
                    }
                    className={inputClass("location")}
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                  <span className="text-sm font-semibold">Date:</span>
                </div>
                <div className="w-full">
                  <input
                    type="date"
                    value={formData?.date}
                    disabled={!isEnabled("date")}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("date", e.target.value)
                    }
                    className={inputClass("date")}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-4">
          <h3 className="text-l font-semibold text-gray-700 mb-1">
            Description of works/defect
          </h3>
          <div>
            <textarea
              name="description"
              id="description"
              value={formData?.description || ""}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                handleInputChange("description", e.target.value)
              }
              disabled={!isEnabled("description")}
              className={inputClass("description")}
              rows={10}
              placeholder="Enter additional comments"
            ></textarea>
          </div>
        </div>

        {/* Recommendation notes */}
        <h3 className="text-l font-semibold text-gray-700 mb-1">
          Recommendation notes:
        </h3>
        <div>
          <textarea
            name="recommendationNotes"
            id="recommendationNotes"
            value={formData?.recommendationNotes || ""}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              handleInputChange("recommendationNotes", e.target.value)
            }
            disabled={!isEnabled("recommendationNotes")}
            className={inputClass("recommendationNotes")}
            rows={4}
            placeholder="Enter additional comments"
          ></textarea>
        </div>

        <DocumentAttachmentForm
          onSubmit={(documents) =>
            setFormData((prev) => ({ ...prev, attachments: documents }))
          }
          mode="new"
          initialDocuments={formData?.attachments || []}
        />

        {/* Signers */}
        <div className="mt-4 flex flex-wrap gap-6">
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

        {/* Actions */}
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

export default JobMaintenanceRequisition;
