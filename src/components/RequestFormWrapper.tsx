import React, { useEffect, useState } from "react";
import useForm from "../common/hooks/useForms";
import type { StageData } from "../common/types";
import type { WorkFlowStage } from "../WorkFlow/widgets/AddEditStageEditor";

// For generic form response, use 'any' unless a stricter type is available.
interface RequestFormWrapperProps {
  loading?: boolean;
  setLoading?: (value: boolean) => void;
  formResponses?: any; // replace with actual type if known
  onSubmit?: (data: any, status: string) => void;
  onCancel?: () => void;
  selectedWorkFlow?: any;
  mode?: "new" | "edit" | string;
  currentWorkflowStage?: WorkFlowStage;
  showActionButtons?: boolean;
  completedStages?: Array<{
    stageId: number;
    status: string;
    [key: string]: any;
  }>;
  parentRequestId?: number;
}

export default function RequestFormWrapper({
  formResponses,
  onSubmit,
  onCancel,
  selectedWorkFlow,
  mode = "new",
  currentWorkflowStage,
  showActionButtons = false,
  completedStages = [],
  loading,
  setLoading,
  parentRequestId,
}: RequestFormWrapperProps) {
  console.log("---------------------", formResponses);

  const [activeTab, setActiveTab] = useState<string>("Form");
  const [activeComponent, setActiveComponent] = useState<React.ReactNode>();
  const { getFormById } = useForm();

  const getStageStatus = (stage: StageData): string => {
    const stageResponse = completedStages?.find(
      (stg: any) => Number(stg.stageId) === Number(stage.id)
    );

    if (
      stage.id ===
      (currentWorkflowStage?.id ?? (currentWorkflowStage as any)?.stageId)
    )
      return "Current";
    return stageResponse?.status ?? "";
  };

  // Define the menu type
  type TabMenuItem = {
    name: string;
    component: (props: any) => React.ReactNode;
  };

  const tabMenu: TabMenuItem[] = [
    {
      name: "Form",
      component: (props: any) => {
        const form = getFormById(
          (props as any)?.formId ?? selectedWorkFlow?.type
        );
        return (
          <div>
            {form?.component({
              formResponses,
              trigerVoucherCreation:
                currentWorkflowStage?.trigerVoucherCreation,
              enableInputList: currentWorkflowStage?.formFields,
              vissibleSections: currentWorkflowStage?.formSections,
              showFormTitle: false,
              onSubmit,
              onCancel,
              instruction: currentWorkflowStage?.instruction,
              showActionButtons,
              completedStages,
              responseTypes: currentWorkflowStage?.responseTypes,
              mode,
              loading,
              setLoading,
              parentRequestId,
            })}
          </div>
        );
      },
    },
    {
      name: "Progress",
      component: () => (
        <div className="bg-white rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">
            Workflow Progress
          </h4>
          <div className="space-y-2">
            {selectedWorkFlow?.stages?.map((stage: any, index: number) => (
              <div key={index} className={`${stage.isSubStage ? "ml-5" : ""}`}>
                <div className="flex items-center">
                  <div
                    className={` ${
                      stage.isSubStage ? "w-5 h-5" : "w-8 h-8"
                    }  rounded-full flex items-center justify-center mr-3 ${
                      getStageStatus(stage) === "Approved" ||
                      getStageStatus(stage) === "Submitted" ||
                      getStageStatus(stage) === "Payment" ||
                      getStageStatus(stage) === "Recommend" ||
                      getStageStatus(stage) === "Procurement"
                        ? "bg-green-500 text-white"
                        : getStageStatus(stage) === "Current"
                        ? "bg-blue-500 text-white"
                        : getStageStatus(stage) === "Rejected"
                        ? "bg-red-300 text-red-600"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {[
                      "Approved",
                      "Submitted",
                      "Payment",
                      "Procurement",
                      "Rejected",
                    ].includes(getStageStatus(stage)) ? (
                      <i className="fas fa-check text-sm"></i>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      getStageStatus(stage) === "Approved" ||
                      getStageStatus(stage) === "Submitted" ||
                      getStageStatus(stage) === "Payment" ||
                      getStageStatus(stage) === "Recommend" ||
                      getStageStatus(stage) === "Procurement"
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
    setActiveComponent(tabMenu[0].component(selectedWorkFlow));
    setActiveTab("Form");
  }, [mode, currentWorkflowStage, selectedWorkFlow, loading]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabMenu.map((menu) => (
            <button
              key={menu.name}
              onClick={() => {
                setActiveTab(menu.name);
                setActiveComponent(menu.component(selectedWorkFlow));
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                activeTab === menu.name
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              type="button"
            >
              {menu.name}
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
