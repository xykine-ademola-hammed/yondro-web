import { useEffect, useState } from "react";
import AddEditWorkflowModal from "../AddEditWorkflowModal";
import { Link, useParams } from "react-router-dom";
import FormViewModal from "../../Forms/FormPreviewModal";
import { useOrganization } from "../../GlobalContexts/Organization-Context";
import { type StageData, type WorkFlow } from "../../common/types";

/**
 * Normalizes "any" input stage (from BE, other components, etc)
 * to ensure all StageData fields have the correct types (especially departmentId).
 */
function normalizeStageData(s: any): StageData {
  return {
    ...s,
    departmentId:
      s.departmentId === null || s.departmentId === undefined
        ? undefined
        : typeof s.departmentId === "string"
        ? isNaN(Number(s.departmentId))
          ? undefined
          : Number(s.departmentId)
        : s.departmentId,
    // If more fields need to be normalized, add here
  };
}

export default function WorkflowDetail() {
  const params = useParams<{ workflowId?: string }>();
  const { workflowId } = params;
  const { workflows } = useOrganization();
  const [activeTab, setActiveTab] = useState<"overview" | "stages">("overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [openWorkflowForm, setOpenWorkflowForm] = useState<boolean>(false);
  const [workflow, setWorkflow] = useState<WorkFlow | undefined>(undefined);
  const [selectedStage, setSelectedStage] = useState<StageData | undefined>(
    undefined
  );

  useEffect(() => {
    const currentWorkflow = workflows.rows.find(
      (wf) => String(wf.id) === String(workflowId)
    );
    setWorkflow(currentWorkflow);
  }, [workflowId, workflows]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Draft":
        return "bg-yellow-100 text-yellow-800";
      case "Inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    workflow && (
      <div className="min-h-screen bg-gray-50">
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-4 mb-6">
              <Link
                to="/workflows"
                className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
              >
                <i className="fas fa-arrow-left text-gray-600"></i>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {workflow?.name}
                </h1>
                <p className="text-gray-600">{workflow?.description}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">
                        Status:
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          workflow?.status
                        )}`}
                      >
                        {workflow?.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Created on {workflow?.createdAt}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-0">
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 font-medium text-sm whitespace-nowrap cursor-pointer"
                      type="button"
                    >
                      Edit Workflow
                    </button>
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm whitespace-nowrap cursor-pointer"
                      type="button"
                    >
                      Start Instance
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                      activeTab === "overview"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                    type="button"
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab("stages")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                      activeTab === "stages"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                    type="button"
                  >
                    Workflow Stages
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Workflow Description
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {workflow?.description}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Workflow Form
                      </h3>

                      <button
                        onClick={() => setOpenWorkflowForm(true)}
                        className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap hover:cursor-pointer"
                        type="button"
                      >
                        {workflow?.name}
                      </button>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Process Flow
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-4 overflow-x-auto">
                          {workflow?.stages?.map((stage, index) => (
                            <div
                              key={stage.id || index}
                              className="flex items-center space-x-4 min-w-0"
                            >
                              <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap">
                                {stage.name}
                              </div>
                              {workflow.stages &&
                                index < workflow.stages.length - 1 && (
                                  <i className="ri-arrow-right-line text-gray-400"></i>
                                )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "stages" && (
                  <div className="space-y-4">
                    {workflow?.stages?.map((stage, index) => (
                      <div
                        key={stage.id || index}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2">
                              <h4 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">
                                {stage.name}
                              </h4>

                              {!stage.assignToRequestor && (
                                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-sm text-gray-500">
                                  <div>Assigned to:</div>
                                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                                    {stage.assignee?.departmentName}{" "}
                                    {stage.assignee?.positionName}
                                  </span>
                                </div>
                              )}

                              {((stage.fields && stage.fields.length > 0) ||
                                stage.isRequireApproval) && (
                                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-sm text-gray-500">
                                  <button
                                    onClick={() => {
                                      // Fixed: Always normalize to StageData shape.
                                      setSelectedStage(
                                        normalizeStageData(stage)
                                      );
                                      setOpenWorkflowForm(true);
                                    }}
                                    className="flex items-center justify-center bg-blue-600 text-white px-3 w-full py-1.5 rounded-lg hover:bg-blue-700 whitespace-nowrap cursor-pointer text-sm"
                                    type="button"
                                  >
                                    Stage form ..
                                  </button>
                                </div>
                              )}
                            </div>
                            <p className="text-gray-600">{stage.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        {openWorkflowForm && (
          <FormViewModal
            modalMode="preview"
            isOpen={openWorkflowForm}
            form={
              selectedStage
                ? { ...selectedStage }
                : workflow?.formId
                ? { formId: workflow.formId }
                : {}
            }
            onClose={() => {
              setOpenWorkflowForm(false);
              setSelectedStage(undefined);
            }}
          />
        )}

        {isEditModalOpen && (
          <AddEditWorkflowModal
            onClose={() => setIsEditModalOpen(false)}
            workflowId={Number(workflowId)}
            isOpen={isEditModalOpen}
            modalMode="edit"
            onSubmit={() => {}}
          />
        )}
      </div>
    )
  );
}
