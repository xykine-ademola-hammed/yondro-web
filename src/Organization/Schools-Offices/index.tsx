// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.
import React, { useState, useEffect } from "react";
import AddEditSchoolOfficeModal from "./AddEditSchoolOfficeModal";
import { type SchoolOffice } from "../../common/types";
import { useMutation } from "@tanstack/react-query";
import { getMutationMethod } from "../../common/api-methods";
import { useAuth } from "../../GlobalContexts/AuthContext";
import { useOrganization } from "../../GlobalContexts/Organization-Context";
import { useToast } from "../../GlobalContexts/ToastContext";
import Pagination from "../../components/Pagination";

const SchoolOfficePage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { schoolOffices, fetchSchoolOffices, schoolOfficeFilter } =
    useOrganization();
  const [offset, setOffset] = useState(0);

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

  const [currentSchoolOffice, setCurrentSchoolOffice] = useState<SchoolOffice>({
    id: 0,
    name: "",
    description: "",
    location: "",
  });

  const { mutateAsync: createSchoolOffice } = useMutation({
    mutationFn: (body: SchoolOffice) =>
      getMutationMethod("POST", `api/school-office`, body, true),
    onSuccess: (data) => {
      fetchSchoolOffices(schoolOfficeFilter);
      showToast("SchoolOffice successfully created", "success");
    },
    onError: async (error) => {
      console.log(error?.message);
      showToast("SchoolOffice creation unsuccessful", "error");
    },
  });

  const handleSchoolOfficeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === "add") {
      // Add new department
      const newSchoolOffice = {
        ...currentSchoolOffice,
        organizationId: String(user?.organizationId),
      };
      createSchoolOffice(newSchoolOffice);
    } else {
      // // Update existing department
      // setSchoolOffices(
      //   schoolOffices?.rows.map((dept) =>
      //     dept.id === currentSchoolOffice.id ? currentSchoolOffice : dept
      //   )
      // );
    }
    // Close modal and reset form
    setIsModalOpen(false);
    setCurrentSchoolOffice({
      id: 0,
      name: "",
      description: "",
      location: "",
    });
  };
  // Handle input change for department form
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCurrentSchoolOffice({
      ...currentSchoolOffice,
      [name]: value,
    });
  };
  // Open modal for adding new department
  const openAddModal = () => {
    setModalMode("add");
    setCurrentSchoolOffice({
      id: 0,
      name: "",
      description: "",
      location: "",
    });
    setIsModalOpen(true);
  };
  // Open modal for editing department
  const openEditModal = (department: typeof currentSchoolOffice) => {
    setModalMode("edit");
    setCurrentSchoolOffice(department);
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
              Add School/Office
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
                placeholder="Search schoolOffices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      {/* SchoolOffices Table */}
      <div className="bg-white shadow rounded-lg mb-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                >
                  <div className="flex items-center">School | Office</div>
                </th>

                <th
                  scope="col"
                  className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                >
                  <div className="flex">Finance Code</div>
                </th>

                <th
                  scope="col"
                  className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                >
                  <div className="flex items-center">Department #</div>
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
              {schoolOffices?.rows?.map((department) => (
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
                  <td>{department?.financeCode}</td>
                  <td>{department?.departments?.length}</td>

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
          totalItems={schoolOffices.count}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Add/Edit SchoolOffice Modal */}
      {isModalOpen && (
        <AddEditSchoolOfficeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          modalMode={modalMode}
          currentSchoolOffice={currentSchoolOffice}
          handleInputChange={handleInputChange}
          handleSchoolOfficeSubmit={handleSchoolOfficeSubmit}
          setCurrentSchoolOffice={setCurrentSchoolOffice}
        />
      )}
    </>
  );
};
export default SchoolOfficePage;
