import React, { useEffect, useRef } from "react";
import ModalWrapper from "../../components/modal-wrapper";
import type { Department } from "../../common/types";

interface AddEditDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalMode: "add" | "edit";
  currentDepartment: Department;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleDepartmentSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const AddEditDepartmentModal: React.FC<AddEditDepartmentModalProps> = ({
  isOpen,
  onClose,
  modalMode,
  currentDepartment,
  handleInputChange,
  handleDepartmentSubmit,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={modalMode === "add" ? "Add New Department" : "Edit Department"}
    >
      <form onSubmit={handleDepartmentSubmit}>
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <div className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Department Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={currentDepartment.name}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="head"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    id="location"
                    value={currentDepartment.location}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="submit"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
          >
            {modalMode === "add" ? "Add Department" : "Save Changes"}
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};

export default AddEditDepartmentModal;
