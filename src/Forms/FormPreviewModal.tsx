import ModalWrapper from "../components/modal-wrapper";
import type { StageData } from "../common/types";
import FormView from "../common/FormView";
import PaymentVoucher from "./widgets/PaymentVoucher-1";

export interface FormViewModalProps {
  formId: number;
  onClose: () => void;
  modalMode: "view" | "preview";
  isOpen: boolean;
}

function FormPreviewViewModal({
  formId,
  onClose,
  modalMode,
  isOpen,
}: FormViewModalProps) {
  const defaultForms = [<>No Form </>, <PaymentVoucher />];

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={modalMode === "preview" ? "Preview Form" : ""}
    >
      {/* <FormView
        showFormTitle={true}
        form={form}
        modalMode="preview"
        showSubmitButton={false}
      /> */}

      {formId && defaultForms[formId]}
    </ModalWrapper>
  );
}

export default FormPreviewViewModal;
