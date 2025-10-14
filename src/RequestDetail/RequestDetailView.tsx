import { useNavigate } from "react-router-dom";
import ConfirmationModal from "./ConfirmationModal";
import RequestFormWrapper from "../components/RequestFormWrapper";
import { useRequestDetailContext } from "./RequestDetailContext";
import { useAuth } from "../GlobalContexts/AuthContext";

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

  console.log("-------selectedRequest-----", selectedRequest);

  return (
    <div className="bg-gray-50">
      <main className="sm:p-0 md:p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
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
              parentRequestId={selectedRequest?.parentRequestId}
              mode="not new"
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
              parentRequestId={selectedRequest?.parentRequestId}
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
