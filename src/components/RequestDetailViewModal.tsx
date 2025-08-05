import React from "react";
import ModalWrapper from "./modal-wrapper";
import type { WorkflowRequest } from "../common/types";
import RequestDetailView from "./RequestDetailView";

interface RequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: WorkflowRequest | null;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

const RequestDetailViewModal: React.FC<RequestDetailModalProps> = ({
  isOpen,
  onClose,
  request,
  onApprove,
  onReject,
}) => {
  if (!isOpen || !request) return null;

  const handleApprove = () => {
    onApprove(request.id);
    onClose();
  };

  const handleReject = () => {
    onReject(request.id);
    onClose();
  };

  return (
    <ModalWrapper title="Request Detail" onClose={onClose} isOpen={isOpen}>
      <RequestDetailView
        isOpen={isOpen}
        onClose={onClose}
        request={request}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </ModalWrapper>
  );
};

export default RequestDetailViewModal;
