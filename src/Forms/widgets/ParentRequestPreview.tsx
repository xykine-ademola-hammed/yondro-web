import { useEffect, useState } from "react";
import type { ApiFilter, WorkflowRequest } from "../../common/types";
import { getMutationMethod } from "../../common/api-methods";
import { useMutation } from "@tanstack/react-query";
import useForm from "../../common/hooks/useForms";

export default function ParentRequestPreview({
  parentRequestId,
  onClose,
}: {
  parentRequestId: number | undefined;
  onClose: () => void;
}) {
  const [parentRequest, setParentRequest] = useState<WorkflowRequest>();
  const { getFormById } = useForm();

  console.log("-------parentRequest------", parentRequest);

  const { mutateAsync: getParentApplicationRequest } = useMutation({
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
    if (parentRequestId) {
      getParentApplicationRequest({
        filters: [
          {
            key: "id",
            value: parentRequestId,
            condition: "equal",
          },
        ],
        limit: 1,
        offset: 0,
      });
    }
  }, [parentRequestId]);

  const requestForm =
    parentRequest?.formId && getFormById(parentRequest?.formId);

  return (
    <div>
      {requestForm?.component({
        mode: "preview",
        formResponses: parentRequest?.formResponses,
        showFormTitle: true,
        onCancel: onClose,
      })}
    </div>
  );
}
