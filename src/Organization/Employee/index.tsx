import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddEditEmployeeModal, { emptyEmployee } from "./AddEditEmployeeModal";
import { useOrganization } from "../../GlobalContexts/Organization-Context";
import type { ApiFilter, Employee } from "../../common/types";
import { useMutation } from "@tanstack/react-query";
import { getMutationMethod } from "../../common/api-methods";
import { useAuth } from "../../GlobalContexts/AuthContext";
import { useToast } from "../../GlobalContexts/ToastContext";
import { cleanEmptyFields } from "../../common/methods";

const statuses = ["Pending", "Approved", "Rejected", "Under Review"];

export default function AllEmployee() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const {
    employees,
    fetchEmployees,
    employeeFilter,
    departments,
    setEmployeeFilter,
  } = useOrganization();

  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee>({
    ...emptyEmployee,
  });

  // Filter and sort employees
  const filteredEmployees = [];
  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const totalPages = 10;

  const { mutateAsync: createEmployee } = useMutation({
    mutationFn: (body: any) =>
      getMutationMethod("POST", `api/employees`, body, true),
    onSuccess: (data) => {
      fetchEmployees(employeeFilter);
      showToast("Employee successfully created", "success");
    },
    onError: async (error) => {
      console.log(error?.message);
      showToast("Employee creation unsuccessful", "error");
    },
  });

  const onSave = (data: Employee) => {
    if (!data?.id) {
      // Add new department
      const newEmployee = cleanEmptyFields({
        ...data,
        organizationId: Number(user?.organizationId),
        password: data.email.split("@")[0],
      });
      console.log("====================", newEmployee);
      createEmployee(newEmployee);
    } else {
      // // Update existing department
      // setDepartments(
      //   departments?.rows.map((dept) =>
      //     dept.id === currentDepartment.id ? currentDepartment : dept
      //   )
      // );
    }
    setIsAddEditModalOpen(false);
    setSelectedEmployee({ ...emptyEmployee });
  };

  useEffect(() => {
    if (selectedDepartment) {
      const updatedFilter: ApiFilter = {
        ...employeeFilter,
        filters: [
          ...employeeFilter.filters,
          {
            key: "departmentId",
            value: selectedDepartment,
            condition: "equal",
          },
        ],
      };
      setEmployeeFilter(updatedFilter);
    } else {
      setEmployeeFilter({
        ...employeeFilter,
        filters: employeeFilter.filters.filter(
          (filter) => filter.key !== "departmentId"
        ),
      });
    }
  }, [selectedDepartment]);

  return (
    <main>
      <div>
        {/* Search and Filter Bar */}
        <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
              <div className="relative flex-1">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
                <input
                  type="text"
                  placeholder="Search employee by email, name, or position..."
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
                onClick={() => setIsAddEditModalOpen(true)}
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 !rounded-button whitespace-nowrap cursor-pointer"
              >
                <i className="fas fa-plus mr-2"></i>
                Add Employee
              </button>
              {/* Search and Filter Section */}
            </div>
          </div>
        </div>

        {/* Should be hidden on large screen */}
        <div className="block md:hidden space-y-4 px-4">
          {employees.rows?.map((employee) => (
            <div
              key={employee.id}
              className="flex p-4 border rounded-lg shadow-sm bg-white items-start justify-between"
            >
              <div className="">
                <div className="text-base font-medium text-gray-900">
                  {employee.firstName} {employee.lastName}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  <div>{employee?.department?.name}</div>
                  <div>{employee?.position?.title}</div>
                  <div>{employee?.email}</div>
                  <div>{employee?.phone}</div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-900 cursor-pointer"
                  title="Edit"
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button
                  type="button"
                  className="text-red-600 hover:text-red-900 cursor-pointer"
                  title="Delete"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Should be hidden on smaller screen */}
        <div className="hidden md:block bg-white shadow rounded-lg overflow-hidden mt-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  >
                    <div className="flex items-center">
                      <span>Employee</span>
                    </div>
                  </th>

                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  >
                    <div className="flex items-center">
                      <span>Position</span>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  >
                    <div className="flex items-center">
                      <span>Department</span>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Phone
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
                {employees?.rows?.length > 0 ? (
                  employees.rows?.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {employee.firstName} {employee.lastName}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {employee.position?.title}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {employee.department?.name}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {employee.email}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {employee.phone}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-900 cursor-pointer"
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-900 cursor-pointer"
                            title="Delete"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No employees found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() =>
                  setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)
                }
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? "text-gray-300 bg-gray-50"
                    : "text-gray-700 bg-white hover:bg-gray-50"
                } !rounded-button whitespace-nowrap cursor-pointer`}
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage(
                    currentPage < totalPages ? currentPage + 1 : totalPages
                  )
                }
                disabled={currentPage === totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === totalPages
                    ? "text-gray-300 bg-gray-50"
                    : "text-gray-700 bg-white hover:bg-gray-50"
                } !rounded-button whitespace-nowrap cursor-pointer`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredEmployees.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {filteredEmployees.length}
                  </span>{" "}
                  results
                </p>
              </div>
              <div className="flex items-center">
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === 1
                        ? "text-gray-300"
                        : "text-gray-500 hover:bg-gray-50"
                    } cursor-pointer`}
                  >
                    <span className="sr-only">First</span>
                    <i className="fas fa-angle-double-left"></i>
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)
                    }
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === 1
                        ? "text-gray-300"
                        : "text-gray-500 hover:bg-gray-50"
                    } cursor-pointer`}
                  >
                    <span className="sr-only">Previous</span>
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border ${
                          currentPage === pageNum
                            ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        } text-sm font-medium cursor-pointer`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() =>
                      setCurrentPage(
                        currentPage < totalPages ? currentPage + 1 : totalPages
                      )
                    }
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === totalPages
                        ? "text-gray-300"
                        : "text-gray-500 hover:bg-gray-50"
                    } cursor-pointer`}
                  >
                    <span className="sr-only">Next</span>
                    <i className="fas fa-chevron-right"></i>
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === totalPages
                        ? "text-gray-300"
                        : "text-gray-500 hover:bg-gray-50"
                    } cursor-pointer`}
                  >
                    <span className="sr-only">Last</span>
                    <i className="fas fa-angle-double-right"></i>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AddEditEmployeeModal
        modalMode={selectedEmployee?.id ? "edit" : "add"}
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSave={onSave}
        employee={selectedEmployee}
      />
    </main>
  );
}
