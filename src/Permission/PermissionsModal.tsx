import React, { useState, useEffect } from "react";
import { X, AlertCircle, Check } from "lucide-react";
import { type Employee } from "../common/types";
import EmployeeTypeahead from "../vouchers/EmployeeTypeahead";

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface UserPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (employee: Employee) => void;
}

const UserPermissionsModal: React.FC<UserPermissionsModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [errors, setErrors] = useState<any>({});

  const permissionCategories = {
    "Voucher Management": [
      {
        id: "create_voucher",
        name: "Create Voucher",
        description: "Create new payment vouchers",
      },
      {
        id: "view_own_vouchers",
        name: "View Own Vouchers",
        description: "View vouchers created by user",
      },
      {
        id: "view_department_vouchers",
        name: "View Department Vouchers",
        description: "View all vouchers in department",
      },
      {
        id: "view_all_vouchers",
        name: "View All Vouchers",
        description: "View all vouchers in organization",
      },
      {
        id: "edit_voucher",
        name: "Edit Voucher",
        description: "Edit voucher details",
      },
      {
        id: "delete_voucher",
        name: "Delete Voucher",
        description: "Delete vouchers",
      },
    ],
    "Approval Management": [
      {
        id: "approve_l1",
        name: "Level 1 Approval",
        description: "First level voucher approval",
      },
      {
        id: "approve_l2",
        name: "Level 2 Approval",
        description: "Second level voucher approval",
      },
      {
        id: "approve_l3",
        name: "Level 3 Approval",
        description: "Third level voucher approval",
      },
      {
        id: "approve_finance",
        name: "Finance Approval",
        description: "Final finance approval",
      },
      {
        id: "reject_voucher",
        name: "Reject Voucher",
        description: "Reject vouchers at any level",
      },
    ],
    "Vote Book Management": [
      {
        id: "manage_votebook",
        name: "Manage Vote Book",
        description: "Create and manage vote book accounts",
      },
      {
        id: "create_votebook_account",
        name: "Create Accounts",
        description: "Create new vote book accounts",
      },
      {
        id: "edit_votebook_account",
        name: "Edit Accounts",
        description: "Edit vote book account details",
      },
      {
        id: "freeze_accounts",
        name: "Freeze Accounts",
        description: "Freeze/unfreeze vote book accounts",
      },
      {
        id: "view_account_balances",
        name: "View Balances",
        description: "View detailed account balances",
      },
    ],
    "Budget Management": [
      {
        id: "manage_budget",
        name: "Manage Budget",
        description: "Create budget adjustments",
      },
      {
        id: "approve_budget",
        name: "Approve Budget",
        description: "Approve budget adjustments",
      },
      {
        id: "post_budget",
        name: "Post Budget",
        description: "Post approved budget adjustments",
      },
      {
        id: "view_budget_reports",
        name: "View Budget Reports",
        description: "View budget analysis and reports",
      },
    ],
    "System Administration": [
      {
        id: "manage_users",
        name: "Manage Users",
        description: "Create and manage user accounts",
      },
      {
        id: "manage_permissions",
        name: "Manage Permissions",
        description: "Assign user permissions",
      },
      {
        id: "view_audit_logs",
        name: "View Audit Logs",
        description: "View system audit trails",
      },
      {
        id: "manage_organizations",
        name: "Manage Organizations",
        description: "Manage organization settings",
      },
      {
        id: "manage_departments",
        name: "Manage Departments",
        description: "Create and manage departments",
      },
    ],
    "Reporting & Analytics": [
      {
        id: "view_reports",
        name: "View Reports",
        description: "Access financial reports",
      },
      {
        id: "export_data",
        name: "Export Data",
        description: "Export data to various formats",
      },
      {
        id: "view_analytics",
        name: "View Analytics",
        description: "Access analytics dashboard",
      },
    ],
    "NCOA Management": [
      {
        id: "view_ncoa",
        name: "View NCOA Codes",
        description: "View Nigerian Chart of Accounts",
      },
      {
        id: "manage_ncoa",
        name: "Manage NCOA",
        description: "Manage NCOA code mappings",
      },
    ],
    "Fiscal Year Management": [
      {
        id: "view_fiscal_years",
        name: "View Fiscal Years",
        description: "View fiscal year information",
      },
      {
        id: "manage_fiscal_years",
        name: "Manage Fiscal Years",
        description: "Create and manage fiscal years",
      },
      {
        id: "close_fiscal_year",
        name: "Close Fiscal Years",
        description: "Close fiscal years and lock periods",
      },
    ],
    "Financial Operations": [
      {
        id: "expenditure_control",
        name: "Expenditure Control",
        description: "Monitor and control expenditures",
      },
      {
        id: "post_vouchers",
        name: "Post Vouchers",
        description: "Post approved vouchers to accounts",
      },
      {
        id: "process_payments",
        name: "Process Payments",
        description: "Process voucher payments",
      },
    ],
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedPermissions(employee?.permissions || []);
    }
  }, [isOpen, employee]);

  // Cleanup only on unmount
  useEffect(() => {
    return () => {
      setEmployee(null);
    };
  }, []);

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions((prev) => {
      if (prev.includes(permissionId)) {
        return prev.filter((p) => p !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleSelectAll = (categoryPermissions: Permission[]) => {
    const categoryIds = categoryPermissions.map((p) => p.id);
    const allSelected = categoryIds.every((id) =>
      selectedPermissions.includes(id)
    );

    if (allSelected) {
      setSelectedPermissions((prev) =>
        prev.filter((p) => !categoryIds.includes(p))
      );
    } else {
      setSelectedPermissions((prev) => {
        const newPermissions = [...prev];
        categoryIds.forEach((id) => {
          if (!newPermissions.includes(id)) {
            newPermissions.push(id);
          }
        });
        return newPermissions;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      if (employee?.id)
        onSubmit({
          ...employee,
          permissions: selectedPermissions,
        });
    } catch (error: any) {
      setErrors({ submit: error.message || "Failed to update permissions" });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Manage Permissions: {employee?.firstName} {employee?.lastName}
            </h3>
            <p className="text-sm text-gray-500">
              {employee?.email} •{" "}
              {employee?.role?.replace("_", " ").toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <EmployeeTypeahead
          onSelect={(selected) => {
            setEmployee(selected);
          }}
          selectedEmployee={employee}
          className=""
          // error,
          label="Search"
          placeholder="Select user..."
          // roleFilter,
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Permission Categories */}
          <div className="max-h-96 overflow-y-auto space-y-6">
            {Object.entries(permissionCategories).map(
              ([category, permissions]) => {
                const categoryPermissions = permissions.map((p) => ({
                  ...p,
                  category,
                }));
                const allSelected = categoryPermissions.every((p) =>
                  selectedPermissions.includes(p.id)
                );

                return (
                  <div
                    key={category}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-900">
                        {category}
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleSelectAll(categoryPermissions)}
                        className={`text-sm font-medium ${
                          allSelected
                            ? "text-red-600 hover:text-red-700"
                            : "text-blue-600 hover:text-blue-700"
                        }`}
                      >
                        {allSelected ? "Deselect All" : "Select All"}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {categoryPermissions.map((permission) => {
                        const isSelected = selectedPermissions.includes(
                          permission.id
                        );

                        return (
                          <div
                            key={permission.id}
                            className={`relative rounded-lg border p-3 cursor-pointer hover:bg-gray-50 ${
                              isSelected
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-300"
                            }`}
                            onClick={() =>
                              handlePermissionToggle(permission.id)
                            }
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0">
                                <div
                                  className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
                                    isSelected
                                      ? "bg-blue-600 border-blue-600"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {isSelected && (
                                    <Check className="h-3 w-3 text-white" />
                                  )}
                                </div>
                              </div>
                              <div className="ml-3 flex-1">
                                <label className="block text-sm font-medium text-gray-900 cursor-pointer">
                                  {permission.name}
                                </label>
                                <p className="text-xs text-gray-500">
                                  {permission.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }
            )}
          </div>

          {/* Selected Permissions Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Selected Permissions ({selectedPermissions.length})
            </h4>
            {selectedPermissions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedPermissions.map((permissionId) => {
                  const permission = Object.values(permissionCategories)
                    .flat()
                    .find((p) => p.id === permissionId);

                  return permission ? (
                    <span
                      key={permissionId}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {permission.name}
                    </span>
                  ) : null;
                })}
              </div>
            ) : (
              <p className="text-sm text-blue-700">No permissions selected</p>
            )}
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
              {loading ? "Updating..." : "Update Permissions"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserPermissionsModal;
