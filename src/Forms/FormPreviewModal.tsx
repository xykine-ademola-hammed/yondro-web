import ModalWrapper from "../components/modal-wrapper";
import type { StageData } from "../common/types";
import FormView from "../common/FormView";
import PaymentVoucher from "./widgets/PaymentVoucher-1";

export interface FormViewModalProps {
  form: JSX.Element;
  onClose: () => void;
  modalMode: "view" | "preview";
  isOpen: boolean;
}

function FormPreviewViewModal({
  form,
  onClose,
  modalMode,
  isOpen,
}: FormViewModalProps) {
  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={modalMode === "preview" ? "Preview Form" : ""}
    >
      {form.component()}
    </ModalWrapper>
  );
}

export default FormPreviewViewModal;
