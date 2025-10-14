import React, { useEffect, useState } from "react";
import { FaUserPlus } from "react-icons/fa";
import ModalWrapper from "../../components/modal-wrapper";
import { useOrganization } from "../../GlobalContexts/Organization-Context";
import type {
  ApiFilter,
  Department,
  Employee,
  Position,
  Unit,
} from "../../common/types";
import { useMutation } from "@tanstack/react-query";
import { getMutationMethod } from "../../common/api-methods";

interface AddEditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Employee) => void;
  employee: Employee | null;
  modalMode: "add" | "edit";
}

export const emptyEmployee: Employee = {
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  phone: "",
  positionName: "",
  departmentName: "",
  location: "",
  isActive: true,
  departmentId: undefined,
  positionId: undefined,
  role: undefined,
};

const AddEditEmployeeModal: React.FC<AddEditEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  modalMode,
  employee,
}) => {
  const { schoolOffices } = useOrganization();
  const [departments, setDepartments] = useState<Department[]>();
  const [positions, setPositions] = useState<Position[]>();
  const [formData, setFormData] = useState<Employee>({ ...emptyEmployee });
  const [units, setUnits] = useState<Unit[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { mutateAsync: fetchDepartmentPositions } = useMutation({
    mutationFn: (body: ApiFilter) =>
      getMutationMethod("POST", `api/positions/get-positions`, body, true),
    onSuccess: (data) => {
      setPositions(data.rows);
    },
    onError: (error) => {
      console.error("Failed to fetch positions:", error);
    },
  });

  useEffect(() => {
    if (employee?.id) setFormData(employee);
  }, [employee]);

  // Helper for direct value setting (type safe)
  const setFieldValue = <K extends keyof Employee>(
    name: K,
    value: Employee[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as string] && String(value).trim() !== "") {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Field change handler for normal React events
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFieldValue(name as keyof Employee, value);
  };

  useEffect(() => {
    if (formData.departmentId) {
      fetchDepartmentPositions({
        filters: [
          {
            key: "departmentId",
            value: formData.departmentId || "",
            condition: "equal",
          },
        ],
        limit: 1000,
        offset: 0,
      });
    }
  }, [formData.departmentId, fetchDepartmentPositions]);

  useEffect(() => {
    if (formData.departmentId) {
      setFieldValue("unitId", undefined);
      const selectedDepartment = departments?.find(
        (dept) => Number(dept.id) === Number(formData.departmentId)
      );
      setPositions(selectedDepartment?.positions);
      if (selectedDepartment?.units) setUnits(selectedDepartment.units);
    } else {
      setUnits([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.departmentId, departments]);

  useEffect(() => {
    if (formData.schoolOrOfficeId) {
      setFieldValue("departmentId", undefined);
      setFieldValue("unitId", undefined);
      const selectedSchoolOrOffice = schoolOffices.rows.find(
        (office) => Number(office.id) === Number(formData.schoolOrOfficeId)
      );

      if (selectedSchoolOrOffice?.departments !== undefined) {
        setDepartments(selectedSchoolOrOffice?.departments);
        setPositions(selectedSchoolOrOffice?.positions);
      }
    } else {
      setUnits([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.schoolOrOfficeId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!formData?.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData?.lastName.trim())
      newErrors.lastName = "Last name is required";
    if (!formData?.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData?.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData?.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData?.positionId) newErrors.position = "Position is required";
    if (!formData?.role) newErrors.role = "Role is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSave({ ...formData });
      setFormData({ ...emptyEmployee });
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={modalMode === "add" ? "Add New Employee" : "Edit Employee"}
    >
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg mb-6">
          <div className="mt-3">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    errors["firstName"] ? "border-red-300" : ""
                  }`}
                />
                {errors["firstName"] && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors["firstName"]}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="middleName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Middle Name
                </label>
                <input
                  type="text"
                  id="middleName"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    errors["middleName"] ? "border-red-300" : ""
                  }`}
                />
                {errors["middleName"] && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors["middleName"]}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    errors["lastName"] ? "border-red-300" : ""
                  }`}
                />
                {errors["lastName"] && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors["lastName"]}
                  </p>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    errors["email"] ? "border-red-300" : ""
                  }`}
                />
                {errors["email"] && (
                  <p className="mt-1 text-sm text-red-600">{errors["email"]}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    errors["phone"] ? "border-red-300" : ""
                  }`}
                />
                {errors["phone"] && (
                  <p className="mt-1 text-sm text-red-600">{errors["phone"]}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label
                  htmlFor="schoolOrOfficeId"
                  className="block text-sm font-medium text-gray-700"
                >
                  School | Office <span className="text-red-500">*</span>
                </label>
                <select
                  name="schoolOrOfficeId"
                  id="schoolOrOfficeId"
                  value={formData.schoolOrOfficeId || ""}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Select School or Office</option>
                  {schoolOffices.rows.map((schoolOrOffice) => (
                    <option key={schoolOrOffice.id} value={schoolOrOffice.id}>
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
                  value={formData.departmentId || ""}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Select Department</option>
                  {departments?.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              {units.length > 0 ? (
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
                    value={formData.unitId || ""}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">Select Unit</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div></div>
              )}

              <div>
                <label
                  htmlFor="positionId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Position/Title <span className="text-red-500">*</span>
                </label>
                <select
                  name="positionId"
                  id="positionId"
                  value={formData.positionId || ""}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Position</option>
                  {positions?.map((position) => (
                    <option key={position.id} value={position.id}>
                      {position.title}
                    </option>
                  ))}
                </select>
                {errors.position && (
                  <p className="mt-1 text-sm text-red-600">{errors.position}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role || ""}
                  onChange={handleInputChange}
                  className={`block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
                    errors.position ? "border-red-300" : ""
                  }`}
                >
                  <option value="">Select Role</option>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Employee">Employee</option>
                </select>
                {errors?.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                )}
              </div>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setErrors({});
                setFormData({ ...emptyEmployee });
                onClose();
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
            >
              <FaUserPlus className="mr-2" />
              {modalMode === "add" ? "Add Employee" : "Save Employee"}
            </button>
          </div>
        </div>
      </form>
    </ModalWrapper>
  );
};

export default AddEditEmployeeModal;
