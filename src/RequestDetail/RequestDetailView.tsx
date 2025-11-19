import { useNavigate } from "react-router-dom";
import ConfirmationModal from "./ConfirmationModal";
import RequestFormWrapper from "../components/RequestFormWrapper";
import { useRequestDetailContext } from "./RequestDetailContext";
import { useAuth } from "../GlobalContexts/AuthContext";
import CommentsPreview from "../Forms/widgets/CommentsPreview";
import { useEffect, useState } from "react";
import type { ApiFilter, WorkflowRequest } from "../common/types";
import { useMutation } from "@tanstack/react-query";
import { getMutationMethod } from "../common/api-methods";

export default function WorkflowDetail2() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    completeStage,
    formResponses,
    isConfirmationModalOpen,
    submissionStatus,
    selectedRequest,
    urlMode,
    currentStageData,
    setComment,
    comment,
    setIsConfirmationModalOpen,
    setSubmissionStatus,
    setFormResponses,
    loading,
    setLoading,
  } = useRequestDetailContext();

  const handleCompleteRequestStage = () => {
    const data = {
      stageId: currentStageData?.id,
      action: submissionStatus,
      comment: comment,
      formResponses,
    };
    completeStage(data);
  };

  const handleConfirmApproval = () => {
    handleCompleteRequestStage();
  };

  const hasActionAbility = () => {
    return currentStageData?.assignedToUserId === user?.id;
  };

  const handleSubmit = async (formResponses: any, status: string) => {
    setSubmissionStatus(status);
    setFormResponses(formResponses);
    setIsConfirmationModalOpen(true);
  };

  function combineFormSections(stages: any): string[] {
    if (!Array.isArray(stages)) return [];
    const allSections = stages.map((stage) => stage.formSections || []).flat();
    // Remove duplicates
    return Array.from(new Set(allSections));
  }

  const [parentRequest, setParentRequest] = useState<WorkflowRequest>();

  const {
    mutateAsync: getParentApplicationRequest,
    isIdle,
    isPending,
  } = useMutation({
    mutationFn: (body: ApiFilter) =>
      getMutationMethod(
        "POST",
        `api/workflowrequest/get-workflow-request-for-processing`,
        body,
        true
      ),
    onSuccess: (data) => {
      setParentRequest(data.rows[0]);
    },
    onError: (error: any) => {
      console.error("Failed to fetch workflow requests:", error);
    },
  });

  useEffect(() => {
    if (selectedRequest?.parentRequestId) {
      getParentApplicationRequest({
        filters: [
          {
            key: "id",
            value: selectedRequest?.parentRequestId,
            condition: "equal",
          },
        ],
        limit: 1,
        offset: 0,
      });
    }
  }, [selectedRequest?.parentRequestId]);

  console.log("------isIdle || isPending---------", isIdle, isPending);

  if (isPending) return null;

  return (
    <div className="bg-gray-50">
      <main className="sm:p-0 md:p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Current Request comments */}

          {selectedRequest?.status === "Approved" ? (
            <RequestFormWrapper
              loading={loading}
              setLoading={setLoading}
              formResponses={selectedRequest?.formResponses || {}}
              selectedWorkFlow={selectedRequest?.workflow}
              currentWorkflowStage={{
                formSections: combineFormSections(
                  selectedRequest?.workflow?.stages
                ),
                name: "Default Name",
                instruction: "",
                isSubStage: false,
                isRequestor: false,
                status: "Pending",
                formFields: [],
                fields: [],
              }}
              completedStages={selectedRequest?.stages?.map((stage: any) => ({
                ...stage,
                stageId: stage.stageId,
                status: stage.status,
              }))}
              onSubmit={() => {}}
              onCancel={() => navigate("/")}
              parentRequest={parentRequest}
              mode="not new"
              commentComp={
                <CommentsPreview
                  request={selectedRequest}
                  parentRequest={parentRequest}
                />
              }
            />
          ) : (
            <RequestFormWrapper
              loading={loading}
              setLoading={setLoading}
              formResponses={selectedRequest?.formResponses || {}}
              onSubmit={handleSubmit}
              onCancel={() => navigate(-1)}
              selectedWorkFlow={selectedRequest?.workflow}
              mode={urlMode || "in_progress"}
              currentWorkflowStage={currentStageData?.stage}
              showActionButtons={
                currentStageData?.status === "Pending" && hasActionAbility()
              }
              completedStages={selectedRequest?.stages?.map((stage: any) => ({
                ...stage,
                stageId: stage.stageId,
                status: stage.status,
              }))}
              parentRequest={parentRequest}
              commentComp={
                <CommentsPreview
                  request={selectedRequest}
                  parentRequest={parentRequest}
                />
              }
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
          submissionStatus={submissionStatus}
        />
      </main>
    </div>
  );
}
