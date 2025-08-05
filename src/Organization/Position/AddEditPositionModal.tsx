import React from "react";
import ModalWrapper from "../../components/modal-wrapper";
import { useOrganization } from "../../GlobalContexts/Organization-Context";
import type { Position } from "../../common/types";

interface AddEditPositionModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  modalMode: "add" | "edit";
  currentPosition: Position;

  setCurrentPosition: (position: any) => void;
  handleInputChange: (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  handlePositionSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export const AddEditPositionModal: React.FC<AddEditPositionModalProps> = ({
  isModalOpen,
  setIsModalOpen,
  modalMode,
  currentPosition,
  setCurrentPosition,
  handleInputChange,
  handlePositionSubmit,
}) => {
  const { departments } = useOrganization();

  return (
    isModalOpen && (
      <ModalWrapper
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === "add" ? "Add New Position" : "Edit Position"}
      >
        <form onSubmit={handlePositionSubmit}>
          <div className="">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="mt-4 space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Position Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={currentPosition.title}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="department"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="departmentId"
                      id="departmentId"
                      value={currentPosition.departmentId}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.rows.map((dept) => (
                        <option value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 mt-4 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm !rounded-button whitespace-nowrap cursor-pointer"
            >
              {modalMode === "add" ? "Add Position" : "Save Changes"}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm !rounded-button whitespace-nowrap cursor-pointer"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      </ModalWrapper>
    )
  );
};
