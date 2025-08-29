import React, { useState } from "react";
import AddEditDepartmentModal from "./AddEditDepartmentModal";
import { type Department } from "../../common/types";
import { useMutation } from "@tanstack/react-query";
import { getMutationMethod } from "../../common/api-methods";
import { useAuth } from "../../GlobalContexts/AuthContext";
import { useOrganization } from "../../GlobalContexts/Organization-Context";
import { useToast } from "../../GlobalContexts/ToastContext";
import Pagination from "../../components/Pagination";

const makeEmptyDepartment = (): Department => ({
  // id is optional, so omit
  name: "",
  description: "",
  location: "",
  // Defensively include array fields per type definition
  positions: [],
  units: [],
  // financeCode etc. optional, left out
});

const DepartmentPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { departments, fetchDepartments, departmentFilter } = useOrganization();
  // Pagination is by 1-based index in Pagination.tsx ("pageNumber"), so start at 1
  const [offset, setOffset] = useState(1);

  // State for search and filter
  const [searchTerm, setSearchTerm] = useState("");

  // State for sorting
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: string;
  } | null>(null);

  // State for add/edit department modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");

  const [currentDepartment, setCurrentDepartment] = useState<Department>(
    makeEmptyDepartment()
  );

  // Request sort
  const requestSort = (key: string) => {
    let direction = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const { mutateAsync: createDepartment } = useMutation({
    mutationFn: (body: Department) =>
      getMutationMethod("POST", `api/departments`, body, true),
    onSuccess: () => {
      fetchDepartments(departmentFilter);
      showToast("Department successfully created", "success");
    },
    onError: async (error: any) => {
      console.log(error?.message);
      showToast("Department creation unsuccessful", "error");
    },
  });

  const handleDepartmentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (modalMode === "add") {
      // Add new department
      const newDepartment: Department = {
        ...currentDepartment,
        organizationId: String(user?.organizationId),
        positions: currentDepartment.positions ?? [],
        units: currentDepartment.units ?? [],
      };
      createDepartment(newDepartment);
    } else {
      // If you wish to implement edit, do so here
    }
    // Close modal and reset form
    setIsModalOpen(false);
    setCurrentDepartment(makeEmptyDepartment());
  };

  // Handle input change for department form
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCurrentDepartment((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  // Open modal for adding new department
  const openAddModal = () => {
    setModalMode("add");
    setCurrentDepartment(makeEmptyDepartment());
    setIsModalOpen(true);
  };
  // Open modal for editing department
  const openEditModal = (department: Department) => {
    setModalMode("edit");
    // Defensive for arrays: fill in [] for units and positions for modal
    setCurrentDepartment({
      ...department,
      positions: department.positions ?? [],
      units: department.units ?? [],
    });
    setIsModalOpen(true);
  };

  const handlePageChange = (pageNumber: number) => {
    setOffset(pageNumber);
  };

  return (
    <>
      <div className="">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end">
          <div className="m-2">
            <button
              onClick={openAddModal}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 !rounded-button whitespace-nowrap cursor-pointer"
            >
              <i className="fas fa-plus mr-2"></i>
              Add Department
            </button>
          </div>
        </div>
      </div>
      {/* Search and Filter */}
      <div className="bg-white shadow rounded-lg mb-6 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-search text-gray-400 text-sm"></i>
              </div>
              <input
                type="text"
                className="bg-gray-100 focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-2 border-none rounded-md text-sm"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Departments Table */}
      <div className="bg-white shadow rounded-lg mb-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("name")}
                >
                  <div className="flex items-center">
                    Department
                    {sortConfig?.key === "name" && (
                      <i
                        className={`fas fa-chevron-${
                          sortConfig.direction === "ascending" ? "up" : "down"
                        } ml-1`}
                      ></i>
                    )}
                  </div>
                </th>

                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                >
                  <div className="flex items-center">Finance Code</div>
                </th>

                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                >
                  <div className="flex items-center">Unit #</div>
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
              {departments?.rows?.map((department) => (
                <tr key={department.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {department.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{department?.financeCode ?? ""}</td>
                  <td>{department?.units?.length ?? 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-900 cursor-pointer"
                        title="Edit"
                        onClick={() => openEditModal(department)}
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

        <Pagination
          currentPage={offset}
          itemsPerPage={10}
          totalItems={departments?.count ?? 0}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Add/Edit Department Modal */}
      {isModalOpen && (
        <AddEditDepartmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          modalMode={modalMode}
          currentDepartment={currentDepartment}
          handleInputChange={handleInputChange}
          handleDepartmentSubmit={handleDepartmentSubmit}
          setCurrentDepartment={setCurrentDepartment}
        />
      )}
    </>
  );
};

export default DepartmentPage;
