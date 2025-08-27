import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../GlobalContexts/ToastContext";
import type {
  ApiFilter,
  CurrentStageData,
  WorkflowRequest,
} from "../common/types";
import { useAuth } from "../GlobalContexts/AuthContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useOrganization } from "../GlobalContexts/Organization-Context";
import { getMutationMethod, getQueryMethod } from "../common/api-methods";
import ConfirmationModal from "./ConfirmationModal";
import RequestFormWrapper from "./RequestFormWrapper";

export default function WorkflowDetail2() {
  const params = useParams();
  const { requestId, urlMode } = params;
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [currentStageData, setCurrentStageResponse] =
    useState<CurrentStageData>();
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<WorkflowRequest>();
  const [formResponses, setFormResponses] = useState({});
  const {
    fetchWorkflowRequest: refetchWorkflowRequest,
    workflowReqiestFilter: refetchFilter,
  } = useOrganization();

  const { mutateAsync: fetchWorkflowRequest } = useMutation({
    mutationFn: (body: ApiFilter) =>
      getMutationMethod(
        "POST",
        `api/workflowrequest/get-workflow-request-for-processing`,
        body,
        true
      ),
    onSuccess: (data) => {
      setSelectedRequest(data.rows[0]);
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

  console.log("-----selectedRequest------------>>>>>>>>---", selectedRequest);

  useEffect(() => {
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
  }, [fetchWorkflowRequest, user?.id, requestId]);

  useEffect(() => {
    if (currentStageDataResponse)
      setCurrentStageResponse(currentStageDataResponse?.currentStage);
  }, [currentStageDataResponse]);

  const { mutateAsync: completeStage } = useMutation({
    mutationFn: (body: any) =>
      getMutationMethod(
        "POST",
        `api/workflowrequest/stage/complete`,
        body,
        true
      ),
    onSuccess: (data) => {
      refetchWorkflowRequest(refetchFilter);
      showToast("Response successfully submitted", "success");
    },
    onError: async (error) => {
      console.log(error?.message);
      showToast("Response submission unsuccessful", "error");
    },
  });

  const handleCompleteRequestStage = (status: string) => {
    const data = {
      stageId: currentStageData?.id,
      action: status,
      comment: comment,
      formResponses,
    };

    // return; // TODO

    // Call backend to create
    completeStage(data);
  };

  const handleConfirmApproval = (status: string) => {
    handleCompleteRequestStage(status);
    setIsConfirmationModalOpen(false);
    navigate(-1);
  };

  const hasActionAbility = () => {
    return currentStageData?.assignedToUserId === user?.id;
  };

  const handleSubmit = async (formResponses) => {
    setFormResponses(formResponses);
    setIsConfirmationModalOpen(true);
  };

  function combineFormSections(stages): string[] {
    if (!Array.isArray(stages)) return [];
    const allSections = stages.map((stage) => stage.formSections || []).flat();
    // Remove duplicates
    return Array.from(new Set(allSections));
  }

  return (
    <div className="bg-gray-50">
      <main className="sm:p-0 md:p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {selectedRequest?.status === "Approved" ? (
            <RequestFormWrapper
              formResponses={selectedRequest?.formResponses || {}}
              selectedWorkFlow={selectedRequest?.workflow}
              currentWorkflowStage={{
                formSections: combineFormSections(
                  selectedRequest?.workflow?.stages
                ),
              }}
              completedStages={selectedRequest?.stages}
            />
          ) : (
            <RequestFormWrapper
              formResponses={selectedRequest?.formResponses || {}}
              onSubmit={handleSubmit}
              onCancel={() => navigate("/")}
              selectedWorkFlow={selectedRequest?.workflow}
              mode={urlMode || "in_progress"}
              currentWorkflowStage={currentStageData?.stage}
              showActionButtons={
                currentStageData?.status === "Pending" && hasActionAbility()
              }
              completedStages={selectedRequest?.stages}
            />
          )}
        </div>

        <ConfirmationModal
          onChangeComment={setComment}
          isOpen={isConfirmationModalOpen}
          onClose={() => {
            setIsConfirmationModalOpen(false);
          }}
          onConfirm={handleConfirmApproval}
          request={selectedRequest}
        />
      </main>
    </div>
  );
}
