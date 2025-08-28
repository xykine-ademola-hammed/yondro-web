import React from "react";
import ModalWrapper from "./modal-wrapper";
import type { WorkflowRequest } from "../common/types";
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (status: string) => void;
  request?: WorkflowRequest;
  onChangeComment: React.Dispatch<React.SetStateAction<string>>;
}
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  request,
  onChangeComment,
}) => {
  if (!isOpen || !request) return null;
  return (
    <ModalWrapper title="Confirm Approval" onClose={onClose} isOpen={isOpen}>
      <div>
        <p className="text-gray-600 mb-4">
          Are you sure you want to <strong>APPROVE</strong> this request?
        </p>
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="mt-4">
            <label
              htmlFor="comment"
              className="block text-sm font-medium text-gray-600 mb-2"
            >
              Comments
            </label>
            <textarea
              id="comment"
              name="comment"
              onChange={(e) => onChangeComment(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Enter your comments here..."
              maxLength={500}
            ></textarea>
            <div className="mt-1 text-xs text-gray-500 text-right">
              Maximum 500 characters
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer !rounded-button whitespace-nowrap"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm("Reject")}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm w-full sm:w-auto"
          >
            Confirm Rejection
          </button>
          <button
            onClick={() => onConfirm("Approve")}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer !rounded-button whitespace-nowrap"
          >
            Confirm Approval
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default ConfirmationModal;
