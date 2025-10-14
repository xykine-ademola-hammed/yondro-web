import { useEffect, useState } from "react";
import AddEditEmployeeModal, { emptyEmployee } from "./AddEditEmployeeModal";
import { useOrganization } from "../../GlobalContexts/Organization-Context";
import type { ApiFilter, Employee } from "../../common/types";
import { useMutation } from "@tanstack/react-query";
import { getMutationMethod } from "../../common/api-methods";
import { useAuth } from "../../GlobalContexts/AuthContext";
import { useToast } from "../../GlobalContexts/ToastContext";
import { cleanEmptyFields } from "../../common/methods";
import { authService } from "../../services/authService";
import UserPermissionsModal from "../../Permission/PermissionsModal";

export default function AllEmployee() {
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
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee>({
    ...emptyEmployee,
  });

  const { mutateAsync: createEmployee } = useMutation({
    mutationFn: (body: any) =>
      getMutationMethod("POST", `api/employees`, body, true),
    onSuccess: async (data) => {
      fetchEmployees(employeeFilter);
      showToast("Employee successfully created", "success");
      const result = await authService.requestReset(data?.data?.email);
      if (result.success) {
        showToast(
          "Email successfully sent to employee to reset password",
          "success"
        );
      }
    },
    onError: async (error) => {
      console.log(error?.message);
      showToast("Employee creation unsuccessful", "error");
    },
  });

  const { mutateAsync: updateEmployee } = useMutation({
    mutationFn: (body: any) =>
      getMutationMethod("PUT", `api/employee/${body.id}`, body, true),
    onSuccess: async (_data) => {
      fetchEmployees(employeeFilter);
      showToast("Employee successfully updated", "success");
      setShowPermissionsModal(false);
    },
    onError: async (error) => {
      console.log(error?.message);
      showToast("Employee updated unsuccessful", "error");
    },
  });

  const onSave = (data: Employee) => {
    if (!data?.id) {
      // Add new employee
      const newEmployee = cleanEmptyFields({
        ...data,
        organizationId: Number(user?.organizationId),
        password: data.email.split("@")[0],
      });
      createEmployee(newEmployee);
    } else {
      updateEmployee(data);
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

  // const pagination = employees?.pagination ?? {
  //   page: 1,
  //   limit: employeeFilter.limit,
  //   total: 0,
  //   totalPages: 1,
  // };

  return (
    <main>
      <div>
        {/* Actions Bar (mobile-friendly) */}
        <div className="mb-2">
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            {/* Secondary action first on mobile so primary sits closest to thumb */}
            <button
              onClick={() => setShowPermissionsModal(true)}
              type="button"
              className="inline-flex w-full sm:w-auto items-center justify-center px-3 py-2 text-sm font-medium rounded-md shadow-sm border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 active:opacity-90 touch-manipulation"
              aria-label="Manage Permission"
            >
              <i className="fas fa-shield-alt mr-2 text-slate-500" />
              Manage Permission
            </button>

            <button
              onClick={() => setIsAddEditModalOpen(true)}
              type="button"
              className="inline-flex w-full sm:w-auto items-center justify-center px-3 py-2 text-sm font-semibold rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 active:opacity-90 touch-manipulation"
              aria-label="Add Employee"
            >
              <i className="fas fa-user-plus mr-2" />
              Add Employee
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
                <input
                  type="text"
                  placeholder="Search employee by email, name, or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div className="">
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
            </div>
          </div>
        </div>

        {/* Should be hidden on large screen */}
        {/* Mobile list */}
        <div className="block md:hidden space-y-3">
          {employees?.rows?.length ? (
            employees.rows.map((employee: any) => {
              const fullName = `${employee?.firstName ?? ""} ${
                employee?.lastName ?? ""
              }`.trim();

              return (
                <div
                  key={employee.id}
                  className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md"
                >
                  {/* Accent bar */}
                  <div className="absolute left-0 top-0 h-full w-1 bg-indigo-500/80" />

                  <div className="flex items-start gap-3">
                    {/* Main */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-[15px] font-semibold text-slate-900">
                            {fullName || "Unnamed Employee"}
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                            {employee?.position?.title && (
                              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                                <i className="fas fa-id-badge mr-1.5 text-[10px] text-slate-500" />
                                {employee.position.title}
                              </span>
                            )}
                            {employee?.department?.name && (
                              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200">
                                <i className="fas fa-building mr-1.5 text-[10px] text-indigo-600" />
                                {employee.department.name}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col flex-shrink-0 gap-1.5">
                          <button
                            onClick={() => {
                              setIsAddEditModalOpen(true);
                              setSelectedEmployee(employee);
                            }}
                            type="button"
                            aria-label="Edit employee"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            title="Edit"
                          >
                            <i className="fas fa-pen" />
                          </button>
                          <button
                            type="button"
                            aria-label="Delete employee"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-red-600 hover:bg-red-50"
                            title="Delete"
                          >
                            <i className="fas fa-trash-alt" />
                          </button>
                        </div>
                      </div>

                      {/* Contacts */}
                      <div className="mt-3 space-y-1.5 text-sm">
                        {employee?.email && (
                          <a
                            href={`mailto:${employee.email}`}
                            className="flex items-center text-slate-600 hover:text-slate-900"
                          >
                            <i className="fas fa-envelope mr-2 text-[12px] text-slate-400" />
                            <span className="truncate">{employee.email}</span>
                          </a>
                        )}
                        {employee?.phone && (
                          <a
                            href={`tel:${employee.phone}`}
                            className="flex items-center text-slate-600 hover:text-slate-900"
                          >
                            <i className="fas fa-phone mr-2 text-[12px] text-slate-400" />
                            <span className="truncate">{employee.phone}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <i className="fas fa-users text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-900">
                No employees found
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Add your first employee to get started.
              </p>
            </div>
          )}
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
                            onClick={() => {
                              setIsAddEditModalOpen(true);
                              setSelectedEmployee(employee);
                            }}
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
        </div>
      </div>
      <AddEditEmployeeModal
        modalMode={selectedEmployee?.id ? "edit" : "add"}
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSave={onSave}
        employee={selectedEmployee}
      />

      {/* User Permissions Modal */}
      <UserPermissionsModal
        isOpen={showPermissionsModal}
        onClose={() => {
          setShowPermissionsModal(false);
        }}
        onSubmit={updateEmployee}
      />
    </main>
  );
}
