import type { WorkflowRequest } from "../../common/types";
import useForm from "../../common/hooks/useForms";

export default function ParentRequestPreview({
  parentRequest,
  onClose,
  showApprovers = true,
  showAddDocument = true,
}: {
  parentRequest?: WorkflowRequest;
  onClose: () => void;
  showApprovers?: boolean;
  showAddDocument?: boolean;
}) {
  const { getFormById } = useForm();

  const requestForm =
    parentRequest?.formId && getFormById(parentRequest?.formId);

  return (
    <div>
      {requestForm?.component({
        mode: "preview",
        formResponses: parentRequest?.formResponses,
        showFormTitle: true,
        onCancel: onClose,
        showApprovers,
        showAddDocument,
      })}
    </div>
  );
}
