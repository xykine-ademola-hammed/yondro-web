import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";
import { getMutationMethod, getQueryMethod } from "../common/api-methods";
import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  ApiFilter,
  CurrentStageData,
  WorkflowRequest,
} from "../common/types";
import { useOrganization } from "../GlobalContexts/Organization-Context";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../GlobalContexts/ToastContext";
import { useAuth } from "../GlobalContexts/AuthContext";

/** Context interface with all exposed values and setters */
export interface RequestDetailContextType {
  loading: boolean;
  setLoading: (value: boolean) => void;
  currentStageData?: CurrentStageData;
  completeStage: (body: any) => Promise<any>;
  urlMode?: string;
  submissionStatus: string;
  setSubmissionStatus: Dispatch<SetStateAction<string>>;
  isConfirmationModalOpen: boolean;
  setIsConfirmationModalOpen: Dispatch<SetStateAction<boolean>>;
  comment: string;
  setComment: Dispatch<SetStateAction<string>>;
  selectedRequest?: WorkflowRequest;
  formResponses: Record<string, any>;
  setFormResponses: Dispatch<SetStateAction<Record<string, any>>>;
}

/** Allow strict null checks and correct typing for consumers */
const RequestDetailContext = createContext<
  RequestDetailContextType | undefined
>(undefined);

interface ProviderProps {
  children: ReactNode;
}

export default function RequestDetailContextProvider({
  children,
}: ProviderProps) {
  const params = useParams();
  const navigate = useNavigate();
  const { requestId, urlMode } = params as {
    requestId?: string;
    urlMode?: string;
  };
  const { showToast } = useToast();
  const { user } = useAuth();

  const [currentStageData, setCurrentStageResponse] =
    useState<CurrentStageData>();
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<WorkflowRequest>();
  const [formResponses, setFormResponses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState("");
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
      queryKey: ["currentStageData", requestId],
      queryFn: () =>
        getQueryMethod(`api/workflowrequest/next-stage/${requestId}`),
      enabled: !!requestId,
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
  }, [fetchWorkflowRequest, refetchCurrentStageData, user?.id, requestId]);

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
    onSuccess: (_data) => {
      setIsConfirmationModalOpen(false);
      navigate(-1);
      refetchWorkflowRequest(refetchFilter);
      showToast("Response successfully submitted", "success");
    },
    onError: async (error) => {
      console.log(error?.message);
      showToast("Response submission unsuccessful", "error");
    },
  });

  const contextValue = {
    currentStageData,
    completeStage,
    urlMode,
    submissionStatus,
    setSubmissionStatus,
    isConfirmationModalOpen,
    setIsConfirmationModalOpen,
    comment,
    setComment,
    selectedRequest,
    formResponses,
    setFormResponses,
    loading,
    setLoading,
  };

  return (
    <RequestDetailContext.Provider value={contextValue}>
      {children}
    </RequestDetailContext.Provider>
  );
}

export function useRequestDetailContext(): RequestDetailContextType {
  const context = useContext(RequestDetailContext);
  if (!context) {
    throw new Error(
      "useRequestDetailContext must be used within a RequestDetailContextProvider"
    );
  }
  return context;
}
