import React, { useEffect, useState } from "react";
import ModalWrapper from "../../components/modal-wrapper";
import { useOrganization } from "../../GlobalContexts/Organization-Context";
import {
  type PositionData,
  type Position,
  type Unit,
  type ApiFilter,
  // Remove Department from types import!
} from "../../common/types";
import type { FormErrors } from "../../Dashboard/new-request";
import { useMutation } from "@tanstack/react-query";
import { getMutationMethod } from "../../common/api-methods";
import { useAuth, type Department } from "../../GlobalContexts/AuthContext";

// Fix the currentPosition type if possible, we use `Position`
interface AddEditPositionModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  modalMode: "add" | "edit";
  currentPosition: Position;
  setCurrentPosition: (position: Position) => void;
  handleInputChange: (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | { target: { name: string; value: any } }
  ) => void;
  handlePositionSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export const AddEditPositionModal: React.FC<AddEditPositionModalProps> = ({
  isModalOpen,
  setIsModalOpen,
  modalMode,
  currentPosition,
  handleInputChange,
  handlePositionSubmit,
}) => {
  const { schoolOffices } = useOrganization();
  const { user } = useAuth();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<PositionData>();
  const [positionSearch, setPositionSearch] = useState<string>("");
  const [showPositionDropdown, setShowPositionDropdown] =
    useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [units, setUnits] = useState<Unit[]>([]);

  const { mutateAsync: fetchPositions } = useMutation({
    mutationFn: (body: ApiFilter) =>
      getMutationMethod("POST", `api/positions/get-positions`, body, true),
    onSuccess: (data) => {
      setPositions(data);
    },
    onError: (error) => {
      console.error("Failed to fetch positions:", error);
    },
  });

  useEffect(() => {
    // When department changes, reset unit
    if (currentPosition.departmentId) {
      handleInputChange({
        target: { name: "unitId", value: "" },
      });
      const selectedDepartment = departments.find(
        (dept) =>
          dept.id && String(dept.id) === String(currentPosition.departmentId)
      );
      if (selectedDepartment?.units) setUnits(selectedDepartment.units);
      else setUnits([]);
    } else {
      setUnits([]);
    }
  }, [currentPosition.departmentId, departments]); // departments typed, empty state default

  useEffect(() => {
    if (currentPosition.schoolOrOfficeId) {
      handleInputChange({
        target: { name: "departmentId", value: "" },
      });
      handleInputChange({
        target: { name: "unitId", value: "" },
      });

      const selectedSchoolOrOffice = schoolOffices.rows.find(
        (dept: any) =>
          Number(dept.id) === Number(currentPosition.schoolOrOfficeId)
      );
      if (selectedSchoolOrOffice?.departments !== undefined) {
        // Fix: convert all department ids to string
        setDepartments(
          selectedSchoolOrOffice.departments.map((dept: any) => ({
            ...dept,
            id: dept.id !== undefined ? String(dept.id) : undefined,
          })) as Department[]
        );
      } else {
        setDepartments([]);
      }
      setUnits([]);
    } else {
      setDepartments([]);
      setUnits([]);
    }
  }, [currentPosition.schoolOrOfficeId, schoolOffices.rows]);

  useEffect(() => {
    if (!user?.organizationId) return; // only query if organizationId exists
    if (positionSearch) {
      fetchPositions({
        filters: [
          {
            key: "organizationId",
            value: user.organizationId,
            condition: "equal",
          },
          {
            key: "title",
            value: positionSearch,
            condition: "like",
          },
        ],
        limit: 50,
        offset: 0,
      });
    } else {
      fetchPositions({
        filters: [
          {
            key: "organizationId",
            value: user.organizationId,
            condition: "equal",
          },
        ],
        limit: 50,
        offset: 0,
      });
    }
  }, [positionSearch, fetchPositions, user?.organizationId]);

  const handleParentPositionSelect = (position: Position) => {
    handleInputChange({
      target: { name: "parentPositionId", value: position.id?.toString() },
    });
    setPositionSearch(`${position.title ?? ""}`);
    setShowPositionDropdown(false);
    if (errors.position) {
      setErrors((prev) => ({ ...prev, position: undefined }));
    }
  };

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
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Position Title
                    </label>
                    <input
                      required
                      type="text"
                      name="title"
                      id="title"
                      value={currentPosition.title}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="schoolOrOfficeId"
                      className="block text-sm font-medium text-gray-700"
                    >
                      School | Office
                    </label>
                    <select
                      name="schoolOrOfficeId"
                      id="schoolOrOfficeId"
                      value={currentPosition.schoolOrOfficeId || ""}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="">Select School or Office</option>
                      {schoolOffices.rows.map((schoolOrOffice: any) => (
                        <option
                          key={schoolOrOffice.id}
                          value={schoolOrOffice.id}
                        >
                          {schoolOrOffice.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="departmentId"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Department
                    </label>
                    <select
                      name="departmentId"
                      id="departmentId"
                      value={currentPosition.departmentId || ""}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="">Select Department</option>
                      {departments?.map((dept: Department) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {units.length > 0 && (
                    <div>
                      <label
                        htmlFor="unitId"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Unit
                      </label>
                      <select
                        name="unitId"
                        id="unitId"
                        value={currentPosition?.unitId || ""}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="">Select Unit</option>
                        {units.map((unit: Unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parent Position
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={positionSearch}
                        onChange={(e) => {
                          setPositionSearch(e.target.value);
                          setShowPositionDropdown(true);
                        }}
                        onFocus={() => setShowPositionDropdown(true)}
                        placeholder="Search and select employee"
                        className={`w-full px-4 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer ${
                          errors.position ? "border-red-300" : "border-gray-300"
                        }`}
                      />
                      <i className="fas fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>

                      {showPositionDropdown && positionSearch && (
                        <div className="absolute z-1050 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {positions?.rows?.length &&
                          positions?.rows.length > 0 ? (
                            positions.rows.map((position: Position) => (
                              <div
                                key={position.id}
                                onClick={() =>
                                  handleParentPositionSelect(position)
                                }
                                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-medium text-gray-900">
                                  {position.title}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {position.department?.name}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-gray-500">
                              No position found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
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
        {/* Work around to ensure position search shows */}
        {showPositionDropdown && positionSearch && (
          <div className="mb-50"></div>
        )}
      </ModalWrapper>
    )
  );
};
