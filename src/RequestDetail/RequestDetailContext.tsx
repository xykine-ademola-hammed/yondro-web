import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useParams } from "react-router-dom";
import type { StageData, WorkflowRequest } from "../common/types";
import { useQuery } from "@tanstack/react-query";
import { getQueryMethod } from "../common/api-methods";

// Define the context type
interface RequestDetailContextType {
  request: WorkflowRequest | null;
  handleConfirm: () => void;
  handleReject: () => void;
  createResponse: (response: string) => void;
}

// Create the context
const RequestDetailContext = createContext<
  RequestDetailContextType | undefined
>(undefined);

// Create a provider component
export const RequestDetailProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const params = useParams();
  const { requestId } = params;

  const [request, setRequest] = useState<WorkflowRequest | null>(null);

  const { data: requestData, refetch: refetchRequestData } = useQuery({
    queryKey: ["requestId"],
    queryFn: () => getQueryMethod(`api/workflowrequest/${requestId}`),
  });

  const { mutateAsync: createRequestStage } = useMutation({
    mutationFn: (body: StageData) =>
      getMutationMethod(
        "PUT",
        `api/workflowrequest/stage-responses/${requestId}`,
        body,
        true
      ),
    onSuccess: (data) => {
      fetchDepartments(departmentFilter);
      showToast("Department successfully created", "success");
    },
    onError: async (error) => {
      console.log(error?.message);
      showToast("Department creation unsuccessful", "error");
    },
  });

  const handleConfirm = (
    step: number,
    status: "Approved" | "Rejected" | "Under Review" | "Pending",
    comment: string
  ) => {
    const stageResponse: StageData = {
      step,
      status,
      comment,
      workFlowRequestId: Number(requestId),
    };
    createRequestStage(stageResponse);
  };

  const handleReject = () => {
    createRequestStage("Rejected");
  };

  const createResponse = useCallback(
    (response: string) => {
      if (request) {
        console.log(`Response created for request ${request.id}: ${response}`);
        // Implement logic to handle the response creation
      }
    },
    [request]
  );

  useEffect(() => {
    if (requestData?.id) {
      setRequest(requestData);
    }
  }, [requestData]);

  return (
    <RequestDetailContext.Provider
      value={{
        request,
        handleConfirm,
        handleReject,
        createResponse,
      }}
    >
      {children}
    </RequestDetailContext.Provider>
  );
};

// Custom hook to use the RequestContext
export const useRequestDetailContext = (): RequestDetailContextType => {
  const context = useContext(RequestDetailContext);
  if (!context) {
    throw new Error("useRequest must be used within a RequestProvider");
  }
  return context;
};
