import React, { useEffect, useRef, useState } from "react";
import { useOrganization } from "../../GlobalContexts/Organization-Context";
import { useAuth } from "../../GlobalContexts/AuthContext";
import moment from "moment";
import useDownloadPdf from "../../common/useDownloadPdf";
import Signer from "../../components/Signer";
import { getFinanceCode } from "../../common/methods";
import spedLogo from "../../assets/spedLogo.png";

const formatDate = (date: Date) => moment(date).format("DD-MM-YYYY");

const requiredFields = [
  "requestorDeligation",
  "date",
  "location",
  "description",
];

const JobMaintenanceRequisition = ({
  formResponses,
  enableInputList = [""],
  vissibleSections = [],
  onSubmit,
  onCancel,
  showActionButtons = false,
  mode = "edit",
}) => {
  console.log("--------enableInputList---------", enableInputList);
  const componentRef = useRef<HTMLDivElement>(null);
  const downloadPdf = useDownloadPdf();
  const { user } = useAuth();
  const [hasErrors, setHasErrors] = useState(false);
  const [formData, setFormData] = useState({
    date: moment(new Date()).format("DD/MM/YYYY"),
    requestorDeligation: getFinanceCode(user),
    ...formResponses,
  });

  const handleInputChange = (fieldId: number | string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [fieldId]: value }));
  };

  useEffect(() => {
    setFormData((prev: any) => ({ ...prev, ...formResponses }));
  }, [formResponses]);

  const isEnabled = (name: string) => enableInputList.includes(name);

  const checkIsValid = () => {
    const required = [];
    for (let enableField of enableInputList) {
      if (requiredFields.includes(enableField) && !formData?.[enableField])
        required.push(enableField);
    }

    return !!required.length;
  };

  const handleSubmit = () => {
    if (!checkIsValid()) {
      onSubmit(formData);
      setFormData({});
      setHasErrors(false);
    } else {
      setHasErrors(true);
    }
  };

  const handleCancel = () => {
    setFormData({});
    onCancel();
  };

  return (
    <div className="">
      <div className="flex justify-end items-end ">
        <button
          className="px-2 py-1 bg-blue-900 text-white rounded"
          onClick={() =>
            downloadPdf(componentRef, {
              fileName: "payment-voucher.pdf",
              orientation: "portrait",
              format: "a4",
              margin: 10,
              scale: 1,
              hideSelectors: ["[data-export-hide]"], // hide buttons during capture
              onBeforeCapture: () => {
                // e.g., switch your form to preview/read-only mode
              },
              onAfterCapture: () => {
                // e.g., restore edit mode if you changed it
              },
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

        <div className=" my-4">
          <div className="">
            <span className="text-sm font-semibold">
              Department/School/Unit:{" "}
            </span>
          </div>
          <div className="flex-6">
            <input
              type="text"
              value={formData?.requestorDeligation ?? ""}
              disabled={!isEnabled("requestorDeligation")}
              onChange={(e) =>
                handleInputChange("requestorDeligation", e.target.value)
              }
              className={`mt-1 w-full p-1 border ${
                isEnabled(`requestorDeligation`)
                  ? "border-red-500"
                  : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
            />
          </div>

          <div className=" my-4">
            <div className="grid grid-cols-2 gap-10">
              <div className="flex flex-rows">
                <div className="flex-1">
                  <span className="text-sm font-semibold">Location: </span>
                </div>
                <div className="flex-6">
                  <input
                    type="text"
                    value={formData?.location ?? ""}
                    disabled={!isEnabled("location")}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    className={`w-full p-1 border ${
                      isEnabled(`location`)
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                  />
                </div>
              </div>

              <div className="flex flex-rows">
                <div className="flex-1">
                  <span className="text-sm font-semibold">Date: </span>
                </div>
                <div className="flex-6">
                  <input
                    type="date"
                    value={formData?.date}
                    disabled={!isEnabled("date")}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className={`w-full p-1 border ${
                      isEnabled(`date`) ? "border-red-500" : "border-gray-300"
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
              value={formData?.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
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
            value={formData?.recommendationNotes}
            onChange={(e) =>
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

        <div className="grid grid-cols-3 gap-20 ">
          <Signer
            firstName={formData?.requestor?.firstName || user?.firstName}
            lastName={formData?.requestor?.firstName || user?.lastName}
            date={
              formData?.requestor?.date ||
              moment(new Date()).format("DD/MM/YYYY")
            }
            department={
              formData?.requestor?.department || user?.department?.name
            }
            position={formData?.requestor?.position || user?.position?.title}
            label="Request by"
          />

          {formData?.approvers?.map((approver: any) => (
            <Signer
              firstName={approver.lastName}
              lastName={approver.firstName}
              date={approver.date}
              department={approver.department}
              position={approver.position}
              label={approver.label}
            />
          ))}
        </div>

        {/* Action Buttons */}
        {showActionButtons && (
          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobMaintenanceRequisition;
