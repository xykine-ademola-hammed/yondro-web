import ModalWrapper from "../components/modal-wrapper";

export interface FormViewModalProps {
  form: any;
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
      {form.component({ mode: "preview" })}
    </ModalWrapper>
  );
}

export default FormPreviewViewModal;
