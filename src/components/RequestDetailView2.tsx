import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../GlobalContexts/ToastContext";
import type {
  ApiFilter,
  CurrentStageData,
  StageCompletionData,
  StageData,
  WorkflowRequest,
} from "../common/types";
import { useAuth } from "../GlobalContexts/AuthContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useOrganization } from "../GlobalContexts/Organization-Context";
import { getMutationMethod, getQueryMethod } from "../common/api-methods";
import { type paymentVoucherDataType } from "../Forms/widgets/PaymentVoucher-1";
import ConfirmationModal from "./ConfirmationModal";
import RejectionModal from "./RejectionModal";
import useForm from "../common/useForms";

export default function WorkflowDetail2() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState("Form");
  const [activeComponent, setActiveComponent] = useState<JSX.Element>();

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
  const [formResponses, setFormResponses] = useState({});
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
    let searchedField: string =
      currentStageData?.stage?.fields?.[0]?.formFields[0];

    console.log("----searchedField-----", searchedField);

    // need to clone nextStage fields to wrap with entered value,
    const fieldsAndResponse = currentStageData?.stage.fields?.map((field) => {
      console.log("----field-----", field);

      if (field?.formFields.length === 1) {
        searchedField = field?.formFields[0];
      }

      return {
        ...field,
        value: formData[field?.id] ?? Number(formResponses[searchedField]),
      };
    });

    console.log("----fieldsAndResponse========-----", fieldsAndResponse);
    console.log("----formResponses========-----", formResponses);

    const data = {
      stageId: currentStageData?.id,
      action: status,
      comment: formData.comment,
      fieldResponses: fieldsAndResponse,
      formResponses,
    };

    // return; // TODO

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

  console.log("------hasActionAbility------", hasActionAbility());
  console.log(
    "------currentStageData?.status ===&& hasActionAbility()------",
    currentStageData?.status === "Pending" && hasActionAbility()
  );

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

  const alphabetMapper = ["a", "b", "c"];

  const { getFormById } = useForm();

  const geComponentProps = (selectedRequest: WorkflowRequest) => {
    const enableInputList: string[] = [];

    currentStageData?.stage.fields.forEach((field) => {
      if (field.formFields?.length === 1) {
        enableInputList.push(field.formFields[0]);
      }
    });

    return {
      paymentVoucherData: {
        ...formResponses,
        applicantName: `${selectedRequest.requestor?.firstName} ${selectedRequest.requestor?.lastName}`,
      },
      enableInputList,
      onFormResponses: setFormResponses,
      onHandleInputChange: handleInputChange,
    };
  };

  const tabMenu = [
    {
      name: "Form",
      component: (props: any) => {
        const componentProps = geComponentProps(props);
        return getFormById(props?.workflow?.formId)?.component(componentProps);
      },
    },

    {
      name: "Docs",
      component: (props: any) => <>Attachments</>,
    },

    {
      name: "Progress",
      component: (props: any) => (
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
                {getSubStages(stage?.id)?.map((subStage: any, i: number) => (
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
                        alphabetMapper[i]
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
      ),
    },

    {
      name: "History",
      component: (props: any) => <>History</>,
    },
    // {
    //   name: "Additional Info.",
    //   component: <>Additional Information</>,
    // },
  ];

  useEffect(() => {
    if (selectedRequest) {
      setActiveComponent(tabMenu[0].component(selectedRequest));
      setFormResponses(selectedRequest.formResponses);
    }
  }, [selectedRequest]);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="sm:p-0 md:p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabMenu.map((menu) => (
                <button
                  key={menu?.name}
                  onClick={() => {
                    setActiveTab(menu?.name);
                    setActiveComponent(menu?.component(selectedRequest));
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
    </div>
  );
}
