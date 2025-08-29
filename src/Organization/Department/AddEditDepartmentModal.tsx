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
  setCurrentDepartment: (dep: any) => void;
}

const AddEditDepartmentModal: React.FC<AddEditDepartmentModalProps> = ({
  isOpen,
  onClose,
  modalMode,
  currentDepartment,
  handleInputChange,
  handleDepartmentSubmit,
  setCurrentDepartment,
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

  // Helper to update units array
  const handleUnitChange = (idx: number, value: string) => {
    const updatedUnits = currentDepartment.units
      ? [...currentDepartment.units]
      : [];
    if (!updatedUnits[idx]) updatedUnits[idx] = { name: "", subUnits: [] };
    updatedUnits[idx].name = value;
    setCurrentDepartment({
      ...currentDepartment,
      units: updatedUnits,
    });
  };

  // Helper to add a new Unit
  const handleAddUnit = () => {
    setCurrentDepartment({
      ...currentDepartment,
      units: currentDepartment.units
        ? [...currentDepartment.units, { name: "", subUnits: [] }]
        : [{ name: "", subUnits: [] }],
    });
  };

  // Helper to remove a Unit
  const handleRemoveUnit = (idx: number) => {
    const updatedUnits = currentDepartment.units
      ? [...currentDepartment.units]
      : [];
    updatedUnits.splice(idx, 1);
    setCurrentDepartment({
      ...currentDepartment,
      units: updatedUnits,
    });
  };

  // Helper to change SubUnit name
  const handleSubUnitChange = (
    unitIdx: number,
    subIdx: number,
    value: string
  ) => {
    const updatedUnits = currentDepartment.units
      ? [...currentDepartment.units]
      : [];
    if (!updatedUnits[unitIdx]) return;
    const newSubUnits = updatedUnits[unitIdx].subUnits
      ? [...updatedUnits[unitIdx].subUnits]
      : [];
    if (!newSubUnits[subIdx]) newSubUnits[subIdx] = { name: "" };
    newSubUnits[subIdx].name = value;
    updatedUnits[unitIdx].subUnits = newSubUnits;
    setCurrentDepartment({
      ...currentDepartment,
      units: updatedUnits,
    });
  };

  // Helper to add a SubUnit in a Unit
  const handleAddSubUnit = (unitIdx: number) => {
    const updatedUnits = currentDepartment.units
      ? [...currentDepartment.units]
      : [];
    if (!updatedUnits[unitIdx]) return;
    updatedUnits[unitIdx].subUnits = updatedUnits[unitIdx].subUnits
      ? [...updatedUnits[unitIdx].subUnits, { name: "" }]
      : [{ name: "" }];
    setCurrentDepartment({
      ...currentDepartment,
      units: updatedUnits,
    });
  };

  // Helper to remove a SubUnit
  const handleRemoveSubUnit = (unitIdx: number, subIdx: number) => {
    const updatedUnits = currentDepartment.units
      ? [...currentDepartment.units]
      : [];
    if (!updatedUnits[unitIdx]) return;
    const newSubUnits = updatedUnits[unitIdx].subUnits
      ? [...updatedUnits[unitIdx].subUnits]
      : [];
    newSubUnits.splice(subIdx, 1);
    updatedUnits[unitIdx].subUnits = newSubUnits;
    setCurrentDepartment({
      ...currentDepartment,
      units: updatedUnits,
    });
  };

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
                    htmlFor="location"
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
                {/* Units and SubUnits */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Units (Optional)
                  </label>
                  {(currentDepartment.units ?? []).map((unit, unitIdx) => (
                    <div key={unitIdx} className="border rounded p-2 mt-2">
                      <div className="flex items-center">
                        <input
                          type="text"
                          placeholder="Unit name"
                          value={unit.name}
                          onChange={(e) =>
                            handleUnitChange(unitIdx, e.target.value)
                          }
                          className="mt-1 flex-1 focus:ring-indigo-500 focus:border-indigo-500 block shadow-sm sm:text-xs border-gray-300 rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveUnit(unitIdx)}
                          className="ml-2 p-1 text-red-500 hover:text-red-700 focus:outline-none"
                        >
                          Remove Unit
                        </button>
                      </div>
                      <div className="ml-4 mt-2">
                        <div className="flex items-center mb-1">
                          <span className="text-xs text-gray-500 font-semibold">
                            SubUnits (Optional)
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddSubUnit(unitIdx)}
                            className="ml-2 px-1 py-0.5 rounded text-xs bg-green-100 text-green-700 hover:bg-green-200"
                          >
                            + Add SubUnit
                          </button>
                        </div>
                        {(unit.subUnits ?? []).map((sub, subIdx) => (
                          <div key={subIdx} className="flex items-center mb-1">
                            <input
                              type="text"
                              placeholder="SubUnit name"
                              value={sub.name}
                              onChange={(e) =>
                                handleSubUnitChange(
                                  unitIdx,
                                  subIdx,
                                  e.target.value
                                )
                              }
                              className="mt-1 flex-1 focus:ring-indigo-500 focus:border-indigo-500 block shadow-sm sm:text-xs border-gray-300 rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveSubUnit(unitIdx, subIdx)
                              }
                              className="ml-2 p-1 text-red-400 hover:text-red-600 focus:outline-none"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddUnit}
                    className="mt-2 px-3 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-medium"
                  >
                    + Add Unit
                  </button>
                </div>
                {/* End Units section */}
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
