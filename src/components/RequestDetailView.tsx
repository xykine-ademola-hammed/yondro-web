import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type {
  ApiFilter,
  CurrentStageData,
  StageCompletionData,
  StageData,
  WorkflowRequest,
} from "../common/types";
import moment from "moment";
import ConfirmationModal from "./ConfirmationModal";
import RejectionModal from "./RejectionModal";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getMutationMethod, getQueryMethod } from "../common/api-methods";
import { useToast } from "../GlobalContexts/ToastContext";
import FieldRender from "./FieldRender";
import { useAuth } from "../GlobalContexts/AuthContext";
import { useOrganization } from "../GlobalContexts/Organization-Context";

interface RequestDetailViewProps {
  isOpen?: boolean;
  onClose?: () => void;
  request?: WorkflowRequest | null;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
}

const RequestDetailView: React.FC<RequestDetailViewProps> = () => {
  const params = useParams();
  const { requestId } = params;
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [currentStageData, setCurrentStageResponse] =
    useState<CurrentStageData>();
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [selectedRequest, setSelectedRequest] = useState<WorkflowRequest>();
  const {
    fetchWorkflowRequest: refetchWorkflowRequest,
    workflowReqiestFilter,
  } = useOrganization();

  console.log("----currentStageData------", currentStageData);
  console.log("========selectedRequest===========", selectedRequest);

  const { mutateAsync: fetchWorkflowRequest } = useMutation({
    mutationFn: (body: ApiFilter) =>
      getMutationMethod(
        "POST",
        `api/workflowrequest/get-workflow-requests`,
        body,
        true
      ),
    onSuccess: (data) => {
      setSelectedRequest(data?.rows[0]);
    },
    onError: (error) => {
      console.error("Failed to fetch workflow requests:", error);
    },
  });

  const { data: currentStageDataResponse, refetch: refetchCurrentStageData } =
    useQuery({
      queryKey: ["currentStageData"],
      queryFn: () =>
        getQueryMethod(`api/workflowrequest/next-stage/${requestId}`),
    });

  useEffect(() => {
    if (requestId) {
      refetchCurrentStageData();
      fetchWorkflowRequest({
        filters: [
          {
            key: "id",
            value: requestId,
            condition: "equal",
          },
        ],
        limit: 1,
        offset: 0,
      });
    }
  }, [requestId]);

  useEffect(() => {
    if (currentStageDataResponse)
      setCurrentStageResponse(currentStageDataResponse?.currentStage);
  }, [currentStageDataResponse]);

  const { mutateAsync: completeStage } = useMutation({
    mutationFn: (body: StageCompletionData) =>
      getMutationMethod(
        "POST",
        `api/workflowrequest/stage/complete`,
        body,
        true
      ),
    onSuccess: (data) => {
      refetchWorkflowRequest(workflowReqiestFilter);
      showToast("Response successfully submitted", "success");
    },
    onError: async (error) => {
      console.log(error?.message);
      showToast("Response submission unsuccessful", "error");
    },
  });

  const handleCompleteRequestStage = (status: "Approve" | "Reject") => {
    // need to clone nextStage fields to wrap with entered value,
    const fieldsAndResponse = currentStageData?.stage.fields?.map((field) => ({
      ...field,
      value: formData[field?.id],
    }));

    console.log("----fieldsAndResponse-----", fieldsAndResponse);

    const data = {
      stageId: currentStageData?.id,
      action: status,
      comment: formData.comment,
      fieldResponses: fieldsAndResponse,
    };

    // Call backend to create
    completeStage(data);
  };

  const handleConfirmApproval = () => {
    handleCompleteRequestStage("Approve");
    setIsApprovalModalOpen(false);
    navigate(-1);
  };
  const handleConfirmRejection = () => {
    handleCompleteRequestStage("Reject");
    setIsRejectionModalOpen(false);
    navigate(-1);
  };

  const hasActionAbility = () => {
    return currentStageData?.assignedTo.id === user?.id;
  };

  const getStageStatus = (stage: StageData) => {
    const stageResponse = selectedRequest?.stages.find(
      (stg) => Number(stg.stageId) === Number(stage.id)
    );

    if (stage.id === currentStageData?.stageId) return "Current";

    return stageResponse?.status;
  };

  const getSubStageStatus = (subStage: StageData) => {
    const stageResponse = selectedRequest?.stages.find(
      (stg) => Number(stg.id) === Number(subStage.id)
    );

    if (subStage.id === currentStageData?.id) return "Current";

    return stageResponse?.status;
  };

  const handleInputChange = (fieldId: number | string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  function getLatestStagesByName(stages: any[]): any[] {
    const latestStageMap = new Map<string, any>();

    for (const stage of stages) {
      const existing = latestStageMap.get(stage.stageName);

      if (!existing) {
        latestStageMap.set(stage.stageName, stage);
      } else {
        const existingDate = new Date(existing.createdAt).getTime();
        const currentDate = new Date(stage.createdAt).getTime();

        if (currentDate > existingDate) {
          latestStageMap.set(stage.stageName, stage);
        }
      }
    }

    return Array.from(latestStageMap.values());
  }

  const getSubStages = (id: number | undefined) => {
    const mainStage = selectedRequest?.stages.find((stg) => stg.stageId === id);
    let result =
      selectedRequest?.stages.filter(
        (stage) => stage?.parentStageId === mainStage?.id
      ) || [];
    return getLatestStagesByName(result);
  };

  const alphabetMapper = {
    1: "a",
    2: "b",
    3: "c",
  };

  return (
    <main className="flex-1 sm:p-6 overflow-auto relative">
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-12 h-8 flex items-center justify-center bg-white rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
        >
          <i className="fas fa-arrow-left text-gray-600"></i>
        </button>
        <div>
          <h1 className="sm:text-2xl md:text-3xl font-bold text-gray-900">
            {selectedRequest?.workflow?.name}
          </h1>
          <p className="text-gray-600">
            {selectedRequest?.workflow?.description}
          </p>
        </div>
        <span
          className={`text-sm font-medium px-2 py-1 rounded-full ${
            currentStageData?.status === "Approved"
              ? "bg-green-100 text-green-800"
              : currentStageData?.status === "Rejected"
              ? "bg-red-100 text-red-800"
              : currentStageData?.status === "Under Review"
              ? "bg-blue-100 text-blue-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {selectedRequest?.status}
        </span>
      </div>

      <div className="rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">
                Employee Information
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Name:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedRequest?.requestor?.firstName}{" "}
                    {selectedRequest?.requestor?.lastName}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Department:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedRequest?.requestor?.department?.name}
                  </span>
                </div>
                {selectedRequest?.requestor?.position?.title && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Current Position:
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedRequest?.requestor?.position?.title}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Timeline</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Submitted:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {moment(selectedRequest?.createdAt).format(
                      "MMMM Do YYYY, h:mm:ss a"
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Updated:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {moment(currentStageData?.updatedAt).format(
                      "MMMM Do YYYY, h:mm:ss a"
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">
                Workflow Progress
              </h4>
              <div className="space-y-4">
                {selectedRequest?.workflow?.stages.map((stage, index) => (
                  <div key={index}>
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          getStageStatus(stage) === "Approved" ||
                          getStageStatus(stage) === "Submitted"
                            ? "bg-green-500 text-white"
                            : getStageStatus(stage) === "Current"
                            ? "bg-blue-500 text-white"
                            : getStageStatus(stage) === "Rejected"
                            ? "bg-red-300 text-red-600"
                            : "bg-gray-300 text-gray-600"
                        }`}
                      >
                        {getStageStatus(stage) === "Approved" ||
                        getStageStatus(stage) === "Rejected" ? (
                          <i className="fas fa-check text-sm"></i>
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span
                        className={`text-sm ${
                          getStageStatus(stage) === "Approved" ||
                          getStageStatus(stage) === "Submitted"
                            ? "text-green-700 font-medium"
                            : getStageStatus(stage) === "Current"
                            ? "text-blue-700 font-medium"
                            : getStageStatus(stage) === "Rejected"
                            ? "text-red-700 font-medium"
                            : "text-gray-500"
                        }`}
                      >
                        {stage.name}
                      </span>
                    </div>
                    {getSubStages(stage?.id)?.map((subStage: any, i) => (
                      <div
                        key={subStage.id}
                        className="ml-5 mt-2 flex items-center"
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                            getSubStageStatus(subStage) === "Approved" ||
                            getSubStageStatus(subStage) === "Submitted"
                              ? "bg-green-500 text-white"
                              : getSubStageStatus(subStage) === "Current"
                              ? "bg-blue-500 text-white"
                              : getSubStageStatus(subStage) === "Rejected"
                              ? "bg-red-300 text-red-600"
                              : "bg-gray-300 text-gray-600"
                          }`}
                        >
                          {getSubStageStatus(subStage) === "Approved" ||
                          getSubStageStatus(subStage) === "Rejected" ? (
                            <i className="fas fa-check text-sm"></i>
                          ) : (
                            alphabetMapper[i + 1]
                          )}
                        </div>
                        <span
                          className={`text-sm ${
                            getSubStageStatus(subStage) === "Approved" ||
                            getSubStageStatus(subStage) === "Submitted"
                              ? "text-green-700 font-medium"
                              : getSubStageStatus(subStage) === "Current"
                              ? "text-blue-700 font-medium"
                              : getSubStageStatus(subStage) === "Rejected"
                              ? "text-red-700 font-medium"
                              : "text-gray-500"
                          }`}
                        >
                          {subStage.stageName}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Comments</h4>
              <div className="space-y-3">
                {selectedRequest?.stages?.map((response, index) => {
                  if (response?.comment)
                    return (
                      <div className="flex justify-between">
                        <div className="text-sm text-gray-600">
                          {response?.assignedTo?.firstName}{" "}
                          {response?.assignedTo?.lastName}:
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {response.comment}
                        </div>
                      </div>
                    );
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">
                Additional responses
              </h4>
              <div className="space-y-3">
                {selectedRequest?.stages?.map(
                  (response) =>
                    Array.isArray(response?.fieldResponses) &&
                    response?.fieldResponses?.map((field) => (
                      <div
                        className={` ${
                          field.type === "textarea"
                            ? ""
                            : "flex justify-between"
                        } `}
                      >
                        <div className="text-sm text-gray-600">
                          {field.label}:
                        </div>
                        {field.type === "file" && field.value ? (
                          <Link
                            className="text-sm text-blue-600"
                            to={field?.value}
                          >
                            Download file
                          </Link>
                        ) : (
                          <div className="text-sm font-medium text-gray-900">
                            {field.value}
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>

              {!currentStageData?.isSubStage &&
                currentStageData?.stage.fields?.map((field) => (
                  <div className="mt-10">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Provide additional information
                    </h4>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                      {field.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    <FieldRender
                      handleInputChange={handleInputChange}
                      formData={formData}
                      field={field}
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200 flex justify-end gap-6">
          {currentStageData?.status === "Pending" && hasActionAbility() && (
            <>
              <button
                onClick={() => {
                  setIsRejectionModalOpen(true);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors cursor-pointer !rounded-button whitespace-nowrap"
              >
                <i className="fas fa-times mr-2"></i>Reject
              </button>
              <button
                onClick={() => setIsApprovalModalOpen(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer !rounded-button whitespace-nowrap"
              >
                <i className="fas fa-check mr-2"></i>Approve
              </button>
            </>
          )}
        </div>
      </div>

      <ConfirmationModal
        onChangeComment={handleInputChange}
        isOpen={isApprovalModalOpen}
        onClose={() => {
          setIsApprovalModalOpen(false);
        }}
        onConfirm={handleConfirmApproval}
        request={selectedRequest}
      />
      <RejectionModal
        onChangeComment={handleInputChange}
        isOpen={isRejectionModalOpen}
        onClose={() => setIsRejectionModalOpen(false)}
        handleConfirmRejection={handleConfirmRejection}
        request={selectedRequest}
      />
    </main>
  );
};

export default RequestDetailView;
