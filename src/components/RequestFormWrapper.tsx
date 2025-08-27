import React, { useEffect, useState } from "react";
import useForm from "../common/useForms";
import type { WorkflowRequest } from "../common/types";
import type { WorkFlowStage } from "../WorkFlow/widgets/AddEditStageEditor";

export default function RequestFormWrapper({
  formResponses,
  onSubmit,
  onCancel,
  selectedWorkFlow,
  mode = "new",
  currentWorkflowStage,
  showActionButtons = false,
  completedStages = [],
}) {
  const [activeTab, setActiveTab] = useState("Form");
  const [activeComponent, setActiveComponent] = useState<JSX.Element>();

  const { getFormById } = useForm();

  console.log("---------completedStages---------", completedStages);

  const getStageStatus = (stage: WorkFlowStage) => {
    const stageResponse = completedStages?.find(
      (stg: any) => Number(stg.stageId) === Number(stage.id)
    );

    if (stage.id === currentWorkflowStage?.id ?? currentWorkflowStage?.stageId)
      return "Current";

    return stageResponse?.status;
  };

  const getComponentProps = (selectedWorkFlow: WorkflowRequest) => {
    return {
      formResponses,
      enableInputList: currentWorkflowStage?.formFields,
      vissibleSections: currentWorkflowStage?.formSections,
      showFormTitle: false,
      onSubmit: onSubmit,
      onCancel: onCancel,
      instruction: currentWorkflowStage?.instruction,
      showActionButtons,
      completedStages,
    };
  };

  const tabMenu = [
    {
      name: "Form",
      component: (props: any) => {
        const componentProps = getComponentProps(props);
        return getFormById(props?.formId)?.component(componentProps);
      },
    },

    {
      name: "Attachments",
      component: (props: any) => <>Attachments</>,
    },

    {
      name: "Progress",
      component: (props: any) => (
        <div className="bg-white rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">
            Workflow Progress
          </h4>
          <div className="space-y-2">
            {selectedWorkFlow?.stages.map((stage, index) => (
              <div key={index} className={`${stage.isSubStage ? "ml-5" : ""}`}>
                <div className="flex items-center">
                  <div
                    className={` ${
                      stage.isSubStage ? "w-5 h-5" : "w-8 h-8"
                    }  rounded-full flex items-center justify-center mr-3 ${
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
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (mode === "new") {
      setActiveComponent(tabMenu[0].component(selectedWorkFlow));
    } else {
      if (currentWorkflowStage && selectedWorkFlow) {
        setActiveComponent(tabMenu[0].component(selectedWorkFlow));
      }
    }
  }, [mode, currentWorkflowStage, selectedWorkFlow]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabMenu.map((menu) => (
            <button
              key={menu?.name}
              onClick={() => {
                setActiveTab(menu?.name);
                setActiveComponent(menu?.component(selectedWorkFlow));
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                activeTab === menu?.name
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {menu?.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="sm:p-1 md:p-6">
        <div className="">{activeComponent}</div>
      </div>
    </div>
  );
}
