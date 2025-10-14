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

interface JobMaintenanceRequisitionForm {
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

const requiredFields: (keyof JobMaintenanceRequisitionForm)[] = [
  "requestorDeligation",
  "date",
  "location",
  "description",
];

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

  const [formData, setFormData] = useState<JobMaintenanceRequisitionForm>({
    date: moment(new Date()).format("YYYY-MM-DD"),
    requestorDeligation: getFinanceCode(user),
    ...formResponses,
  });

  // Handle text, textarea, and date inputs
  const handleInputChange = (
    fieldId: keyof JobMaintenanceRequisitionForm,
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
                className={`mt-1 w-full p-1 border ${
                  isEnabled("requestorDeligation")
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
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
                    className={`w-full p-1 border ${
                      isEnabled("location")
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
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
                    className={`w-full p-1 border ${
                      isEnabled("date") ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

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
              className={`mt-1 w-full p-1 border ${
                isEnabled("description") ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
              rows={10}
              placeholder="Enter additional comments"
            ></textarea>
          </div>
        </div>

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
            className={`mt-1 w-full p-1 border ${
              isEnabled("recommendationNotes")
                ? "border-red-500"
                : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
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

export default JobMaintenanceRequisition;
