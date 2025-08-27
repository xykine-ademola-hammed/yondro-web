// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.

import React, { useEffect, useState } from "react";
import { AddEditPositionModal } from "./AddEditPositionModal";
import { type ApiFilter, type Position } from "../../common/types";
import { useOrganization } from "../../GlobalContexts/Organization-Context";
import { useMutation } from "@tanstack/react-query";
import { getMutationMethod } from "../../common/api-methods";
import { useAuth } from "../../GlobalContexts/AuthContext";
import { useToast } from "../../GlobalContexts/ToastContext";
import { cleanEmptyFields } from "../../common/methods";

const PositionPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const {
    departments,
    positions,
    fetchPositions,
    positionFilter,
    setPositionFilter,
  } = useOrganization();

  // State for search and filter
  const [searchTerm, setSearchTerm] = useState("");

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // State for add/edit position modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentPosition, setCurrentPosition] = useState<Position>({
    departmentId: undefined,
    title: "",
    departmentName: "",
    description: "",
  });

  const { mutateAsync: createPosition } = useMutation({
    mutationFn: (body: any) =>
      getMutationMethod("POST", `api/positions`, body, true),
    onSuccess: (data) => {
      fetchPositions(positionFilter);
      showToast("Position successfully created", "success");
    },
    onError: async (error) => {
      console.log(error?.message);
      showToast("Position creation unsuccessful", "error");
    },
  });

  // Handle position form submission
  const handlePositionSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (modalMode === "add") {
      // Add new position
      const newPosition = cleanEmptyFields({
        ...currentPosition,
        organizationId: Number(user?.organizationId),
      });
      console.log("=========", newPosition);

      createPosition(newPosition);
    } else {
    }

    setIsModalOpen(false);
    setCurrentPosition({
      departmentId: 0,
      title: "",
      departmentName: "",
      description: "",
      organizationId: undefined,
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    console.log("-----handleInputChange------", name, value);
    setCurrentPosition({
      ...currentPosition,
      [name]: value,
    });
  };

  const openAddModal = () => {
    setModalMode("add");
    setCurrentPosition({
      departmentId: 0,
      title: "",
      departmentName: "",
      description: "",
    });
    setIsModalOpen(true);
  };

  // Open modal for editing position
  const openEditModal = (position: typeof currentPosition) => {
    setModalMode("edit");
    setCurrentPosition(position);
    setIsModalOpen(true);
  };

  const [selectedDepartment, setSelectedDepartment] = useState("");

  useEffect(() => {
    if (selectedDepartment) {
      const updatedFilter: ApiFilter = {
        ...positionFilter,
        filters: [
          ...positionFilter.filters,
          {
            key: "departmentId",
            value: selectedDepartment,
            condition: "equal",
          },
        ],
      };
      setPositionFilter(updatedFilter);
    } else {
      setPositionFilter({
        ...positionFilter,
        filters: positionFilter.filters.filter(
          (filter) => filter.key !== "departmentId"
        ),
      });
    }
  }, [selectedDepartment]);

  return (
    <>
      {/* Search and Filter Bar */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
            <div className="relative flex-1">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
              <input
                type="text"
                placeholder="Search position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="flex space-x-3">
              <div className="relative">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none cursor-pointer pr-8"
                >
                  <option value="">All Departments</option>
                  {departments.rows.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                <i className="fas fa-chevron-down absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 !rounded-button whitespace-nowrap cursor-pointer"
            >
              <i className="fas fa-plus mr-2"></i>
              Add Position
            </button>
            {/* Search and Filter Section */}
          </div>
        </div>
      </div>

      {/* Positions Table */}
      <div className="bg-white shadow rounded-lg mb-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                >
                  <div className="flex items-center">Position Title</div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                >
                  <div className="flex items-center">School | Office</div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                >
                  <div className="flex items-center">Department</div>
                </th>

                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {positions?.rows?.map((position) => (
                <tr key={position.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        {position.title}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {position?.schoolOrOffice?.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {position.department?.name}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-900 cursor-pointer"
                        title="Edit"
                        onClick={() => openEditModal(position)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>

                      <button
                        className="text-red-600 hover:text-red-900 cursor-pointer"
                        title="Delete"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Position Modal */}
      {isModalOpen && (
        <AddEditPositionModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          modalMode={modalMode}
          currentPosition={currentPosition}
          setCurrentPosition={setCurrentPosition}
          handleInputChange={handleInputChange}
          handlePositionSubmit={handlePositionSubmit}
        />
      )}
    </>
  );
};

export default PositionPage;
