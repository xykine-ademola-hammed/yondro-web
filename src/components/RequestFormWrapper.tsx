import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  type JSX,
} from "react";
import useForm from "../common/hooks/useForms";
import type { StageData, WorkFlow, WorkflowRequest } from "../common/types";
import type { WorkFlowStage } from "../WorkFlow/widgets/AddEditStageEditor";

interface RequestFormWrapperProps {
  loading?: boolean;
  setLoading?: (value: boolean) => void;
  formResponses?: any; // Replace with actual type (e.g., Record<string, any>) if known
  onSubmit?: (data: any, status: string) => void;
  onCancel?: () => void;
  selectedWorkFlow?: WorkFlow;
  mode?: "new" | "edit" | string;
  currentWorkflowStage?: WorkFlowStage;
  showActionButtons?: boolean;
  completedStages?: StageData[];
  parentRequestId?: number;
  requestId?: number;
  commentComp?: JSX.Element | null;
  parentRequest?: WorkflowRequest | undefined;
}

const STATUS_VARIANTS = {
  success: {
    bg: "bg-green-500 text-white",
    text: "text-green-700 font-medium",
    icon: "fas fa-check text-sm",
  },
  current: {
    bg: "bg-blue-500 text-white",
    text: "text-blue-700 font-medium",
    icon: null, // Uses number
  },
  rejected: {
    bg: "bg-red-300 text-red-600",
    text: "text-red-700 font-medium",
    icon: null, // Uses number
  },
  default: {
    bg: "bg-gray-300 text-gray-600",
    text: "text-gray-500",
    icon: null, // Uses number
  },
} as const;

const SUCCESS_STATUSES = [
  "Approved",
  "Submitted",
  "Payment",
  "Recommend",
  "Procurement",
] as const;

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
  requestId,
  commentComp,
  parentRequest,
}: RequestFormWrapperProps) {
  const [activeTab, setActiveTab] = useState<string>("Form");
  const [activeComponent, setActiveComponent] = useState<React.ReactNode>();
  const { getFormById } = useForm();

  const currentStageId = useMemo(
    () => currentWorkflowStage?.id ?? (currentWorkflowStage as any)?.stageId,
    [currentWorkflowStage]
  );

  const getStageStatus = useCallback(
    (stage: WorkFlowStage): StageData | undefined => {
      const stageResponse = completedStages?.find(
        (stg) => Number(stg.stageId) === Number(stage.id)
      );

      if (stage.id === currentStageId && stageResponse) {
        return { ...stageResponse, status: "Current" };
      }
      return stageResponse;
    },
    [completedStages, currentStageId]
  );

  const getStatusVariant = useCallback((status?: string) => {
    if (status === "Current") return "current";
    if (status === "Rejected") return "rejected";
    if (SUCCESS_STATUSES.includes(status as any)) return "success";
    return "default";
  }, []);

  const getStageIcon = useCallback(
    (status: string, index: number) => {
      const variant = getStatusVariant(status);
      return STATUS_VARIANTS[variant].icon ? (
        <i className={STATUS_VARIANTS[variant].icon}></i>
      ) : (
        index + 1
      );
    },
    [getStatusVariant]
  );

  // Define the menu type
  type TabMenuItem = {
    name: string;
    component: (props: any) => React.ReactNode;
  };

  const tabMenu: TabMenuItem[] = useMemo(
    () => [
      {
        name: "Form",
        component: (props: any) => {
          const formId = (props as any)?.formId ?? selectedWorkFlow?.type;
          const form = getFormById(formId);

          return (
            <div>
              {commentComp}
              {form?.component({
                formResponses,
                triggerVoucherCreation:
                  currentWorkflowStage?.triggerVoucherCreation, // Note: Consider renaming prop to 'triggerVoucherCreation'
                enableInputList: currentWorkflowStage?.formFields,
                vissibleSections: currentWorkflowStage?.formSections, // Fixed typo: 'vissibleSections'
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
                parentRequest,
                requestId,
              })}
            </div>
          );
        },
      },
      {
        name: "Progress",
        component: () => (
          <ProgressTab
            stages={selectedWorkFlow?.stages ?? []}
            getStageStatus={getStageStatus}
            getStatusVariant={getStatusVariant}
            getStageIcon={getStageIcon}
          />
        ),
      },
    ],
    [
      getFormById,
      formResponses,
      selectedWorkFlow?.type,
      currentWorkflowStage,
      onSubmit,
      onCancel,
      showActionButtons,
      completedStages,
      mode,
      loading,
      setLoading,
      parentRequestId,
      getStageStatus,
      getStatusVariant,
      getStageIcon,
      parentRequest,
    ]
  );

  const handleTabChange = useCallback(
    (menuItem: TabMenuItem) => {
      setActiveTab(menuItem.name);
      setActiveComponent(menuItem.component(selectedWorkFlow));
    },
    [selectedWorkFlow]
  );

  useEffect(() => {
    // Only reset if mode or workflow changes; ignore loading to avoid unnecessary re-renders
    setActiveComponent(tabMenu[0].component(selectedWorkFlow));
    setActiveTab("Form");
  }, [mode, selectedWorkFlow, currentWorkflowStage]); // Removed 'loading' from deps

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabMenu.map((menu) => (
            <button
              key={menu.name}
              onClick={() => handleTabChange(menu)}
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
        <div>{activeComponent}</div>
      </div>
    </div>
  );
}

// Extracted Progress tab as a separate component for readability
interface ProgressTabProps {
  stages: WorkFlowStage[];
  getStageStatus: (stage: WorkFlowStage) => StageData | undefined;
  getStatusVariant: (status?: string) => keyof typeof STATUS_VARIANTS;
  getStageIcon: (status: string, index: number) => React.ReactNode;
}

function ProgressTab({
  stages,
  getStageStatus,
  getStatusVariant,
  getStageIcon,
}: ProgressTabProps) {
  return (
    <div className="bg-white rounded-lg p-4">
      <h4 className="font-semibold text-gray-900 mb-3">Workflow Progress</h4>
      <div className="space-y-2">
        {stages.map((stage, index) => {
          const stageResponse = getStageStatus(stage);
          const status = stageResponse?.status;
          const variant = getStatusVariant(status);
          const comment = stageResponse?.comment;
          const assignedEmployee = stageResponse?.assignedTo;
          const employeeName = assignedEmployee
            ? `${assignedEmployee.firstName} ${assignedEmployee.lastName}`.trim()
            : null;
          const sizeClass = stage.isSubStage ? "w-5 h-5" : "w-8 h-8";
          const indentClass = stage.isSubStage ? "ml-5" : "";

          return (
            <div key={index} className={indentClass}>
              <div className="flex items-start">
                <div
                  className={`${sizeClass} rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${STATUS_VARIANTS[variant].bg}`}
                >
                  {status ? getStageIcon(status, index) : index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <span
                    className={`text-sm block ${STATUS_VARIANTS[variant].text}`}
                  >
                    {stage.name}
                  </span>
                  {employeeName && (
                    <div className="text-xs text-gray-600 mt-0.5">
                      {employeeName}
                    </div>
                  )}
                  {comment && (
                    <div className="text-xs text-gray-500 mt-1 italic break-words">
                      {comment}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
