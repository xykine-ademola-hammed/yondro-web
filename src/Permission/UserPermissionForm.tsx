import React, { useState, useEffect } from "react";
import { X, AlertCircle, User, Mail, Shield, Building } from "lucide-react";
import { userAPI } from "../services/api";

interface Department {
  id: number;
  name: string;
  code: string;
}

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingUser?: any | null;
}

const UserForm: React.FC<UserFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingUser,
}) => {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    role: "requester",
    department_id: "",
    is_active: true,
  });
  const [errors, setErrors] = useState<any>({});

  const roles = [
    {
      value: "requester",
      label: "Requester",
      description: "Can create and submit vouchers",
    },
    {
      value: "approver_l1",
      label: "L1 Approver",
      description: "First level approval authority",
    },
    {
      value: "approver_l2",
      label: "L2 Approver",
      description: "Second level approval authority",
    },
    {
      value: "approver_l3",
      label: "L3 Approver",
      description: "Third level approval authority",
    },
    {
      value: "finance_officer",
      label: "Finance Officer",
      description: "Financial approval and vote book management",
    },
    {
      value: "expenditure_control",
      label: "Expenditure Control",
      description: "Expenditure oversight and control",
    },
    {
      value: "auditor",
      label: "Auditor",
      description: "Audit and compliance oversight",
    },
    {
      value: "admin",
      label: "Administrator",
      description: "Full system access and user management",
    },
  ];

  useEffect(() => {
    if (isOpen) {
      loadDepartments();
      if (editingUser) {
        setFormData({
          email: editingUser.email,
          password: "",
          confirmPassword: "",
          first_name: editingUser.first_name,
          last_name: editingUser.last_name,
          role: editingUser.role,
          department_id: editingUser.department_id?.toString() || "",
          is_active: editingUser.is_active,
        });
      } else {
        resetForm();
      }
    }
  }, [isOpen, editingUser]);

  const loadDepartments = async () => {
    try {
      // This would typically come from a departments API endpoint
      // For now, using mock data
      setDepartments([
        { id: 1, name: "Finance Department", code: "FIN" },
        { id: 2, name: "Human Resources", code: "HR" },
        { id: 3, name: "Information Technology", code: "IT" },
        { id: 4, name: "Operations", code: "OPS" },
      ]);
    } catch (error) {
      console.error("Failed to load departments:", error);
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";

    if (!editingUser) {
      if (!formData.password) newErrors.password = "Password is required";
      else if (formData.password.length < 6)
        newErrors.password = "Password must be at least 6 characters";

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    } else if (
      formData.password &&
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.first_name.trim())
      newErrors.first_name = "First name is required";
    if (!formData.last_name.trim())
      newErrors.last_name = "Last name is required";
    if (!formData.role) newErrors.role = "Role is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const userData = {
        email: formData.email.trim().toLowerCase(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        role: formData.role,
        department_id: formData.department_id
          ? parseInt(formData.department_id)
          : undefined,
        is_active: formData.is_active,
        ...(formData.password && { password: formData.password }),
      };

      if (editingUser) {
        await userAPI.updateUser(editingUser.id, userData);
      } else {
        await userAPI.createUser(userData);
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      setErrors({
        submit:
          error.message ||
          `Failed to ${editingUser ? "update" : "create"} user`,
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      first_name: "",
      last_name: "",
      role: "requester",
      department_id: "",
      is_active: true,
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            {editingUser ? "Edit User" : "Create New User"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) =>
                    handleFormChange("first_name", e.target.value)
                  }
                  className={`block w-full pl-10 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.first_name ? "border-red-300" : ""
                  }`}
                  placeholder="Enter first name"
                />
              </div>
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) =>
                    handleFormChange("last_name", e.target.value)
                  }
                  className={`block w-full pl-10 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.last_name ? "border-red-300" : ""
                  }`}
                  placeholder="Enter last name"
                />
              </div>
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  className={`block w-full pl-10 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.email ? "border-red-300" : ""
                  }`}
                  placeholder="Enter email address"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {!editingUser && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      handleFormChange("password", e.target.value)
                    }
                    className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.password ? "border-red-300" : ""
                    }`}
                    placeholder="Enter password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleFormChange("confirmPassword", e.target.value)
                    }
                    className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.confirmPassword ? "border-red-300" : ""
                    }`}
                    placeholder="Confirm password"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </>
            )}

            {editingUser && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password (optional)
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      handleFormChange("password", e.target.value)
                    }
                    className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.password ? "border-red-300" : ""
                    }`}
                    placeholder="Leave blank to keep current password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleFormChange("confirmPassword", e.target.value)
                    }
                    className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.confirmPassword ? "border-red-300" : ""
                    }`}
                    placeholder="Confirm new password"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Role *
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {roles.map((role) => {
                const isSelected = formData.role === role.value;

                return (
                  <div
                    key={role.value}
                    className={`relative rounded-lg border p-4 cursor-pointer hover:bg-gray-50 ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300"
                    }`}
                    onClick={() => handleFormChange("role", role.value)}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <Shield
                          className={`h-5 w-5 ${
                            isSelected ? "text-blue-600" : "text-gray-400"
                          }`}
                        />
                      </div>
                      <div className="ml-3 flex-1">
                        <label className="block text-sm font-medium text-gray-900 cursor-pointer">
                          {role.label}
                        </label>
                        <p className="text-sm text-gray-500">
                          {role.description}
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={isSelected}
                      onChange={() => handleFormChange("role", role.value)}
                      className="absolute top-4 right-4"
                    />
                  </div>
                );
              })}
            </div>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role}</p>
            )}
          </div>

          {/* Department and Status */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  value={formData.department_id}
                  onChange={(e) =>
                    handleFormChange("department_id", e.target.value)
                  }
                  className="block w-full pl-10 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select Department (Optional)</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.code} - {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="is_active"
                    value="true"
                    checked={formData.is_active === true}
                    onChange={() => handleFormChange("is_active", true)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="is_active"
                    value="false"
                    checked={formData.is_active === false}
                    onChange={() => handleFormChange("is_active", false)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Inactive
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Error Messages */}
          {errors.submit && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {errors.submit}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading
                ? editingUser
                  ? "Updating..."
                  : "Creating..."
                : editingUser
                ? "Update User"
                : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
