import React, { useState, useEffect } from "react";
import { useAuth } from "../GlobalContexts/AuthContext";
import { userAPI } from "../services/api";
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Lock,
  Unlock,
  Shield,
  Mail,
  Calendar,
  Building,
  UserCheck,
  UserX,
  Settings,
} from "lucide-react";
import UserForm from "./UserPermissionForm";
import UserPermissionsModal from "./PermissionsModal";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  permissions: string[];
  organization_id: number;
  department_id?: number;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  Department?: {
    name: string;
    code: string;
  };
  Organization: {
    name: string;
    code: string;
  };
}

const PermissionManagement: React.FC = () => {
  const { hasPermission } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    department_id: "",
    is_active: "true",
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
  });
  const [_selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getUsers(filters);
      setUsers(response.users || []);
      setPagination(
        response.pagination || { total: 0, totalPages: 0, currentPage: 1 }
      );
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
  };

  const toggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      await userAPI.updateUser(userId, { is_active: !currentStatus });
      await loadUsers();
    } catch (error) {
      console.error("Failed to toggle user status:", error);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { bg: "bg-purple-100", text: "text-purple-800", label: "Admin" },
      requester: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Requester",
      },
      approver_l1: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "L1 Approver",
      },
      approver_l2: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "L2 Approver",
      },
      approver_l3: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "L3 Approver",
      },
      finance_officer: {
        bg: "bg-orange-100",
        text: "text-orange-800",
        label: "Finance Officer",
      },
      expenditure_control: {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "Expenditure Control",
      },
      auditor: { bg: "bg-gray-100", text: "text-gray-800", label: "Auditor" },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
      label: role,
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        <Shield className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <UserCheck className="h-3 w-3 mr-1" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <UserX className="h-3 w-3 mr-1" />
        Inactive
      </span>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatLastLogin = (lastLogin?: string) => {
    if (!lastLogin) return "Never";

    const now = new Date();
    const loginDate = new Date(lastLogin);
    const diffTime = Math.abs(now.getTime() - loginDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays <= 7) {
      return `${diffDays} days ago`;
    } else {
      return formatDate(lastLogin);
    }
  };

  if (!hasPermission("permission_management")) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Access Denied
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          You don't have permission to manage users.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowUserForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Users
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {users.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserCheck className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Users
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {users.filter((u) => u.is_active).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Shield className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Admins
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {users.filter((u) => u.role === "admin").length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserX className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Inactive
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {users.filter((u) => !u.is_active).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange("role", e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="requester">Requester</option>
              <option value="approver_l1">L1 Approver</option>
              <option value="approver_l2">L2 Approver</option>
              <option value="approver_l3">L3 Approver</option>
              <option value="finance_officer">Finance Officer</option>
              <option value="expenditure_control">Expenditure Control</option>
              <option value="auditor">Auditor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.is_active}
              onChange={(e) => handleFilterChange("is_active", e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              value={filters.department_id}
              onChange={(e) =>
                handleFilterChange("department_id", e.target.value)
              }
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Departments</option>
              {/* This would be populated from departments API */}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={loadUsers}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white shadow-sm rounded-lg">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading users...</p>
          </div>
        ) : users.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm text-gray-900">
                              {user.Department?.name || "No Department"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.Department?.code || ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.is_active)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-500">
                            {formatLastLogin(user.last_login)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-500">
                            {formatDate(user.created_at)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowPermissionsModal(true);
                            }}
                            className="p-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-full"
                            title="Manage Permissions"
                          >
                            <Settings className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setShowUserForm(true);
                            }}
                            className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"
                            title="Edit User"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              toggleUserStatus(user.id, user.is_active)
                            }
                            className={`p-1 rounded-full hover:bg-gray-100 ${
                              user.is_active
                                ? "text-red-600 hover:text-red-700"
                                : "text-green-600 hover:text-green-700"
                            }`}
                            title={
                              user.is_active
                                ? "Deactivate User"
                                : "Activate User"
                            }
                          >
                            {user.is_active ? (
                              <Lock className="h-4 w-4" />
                            ) : (
                              <Unlock className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden">
              <div className="space-y-4 p-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1">
                        {getRoleBadge(user.role)}
                        {getStatusBadge(user.is_active)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="text-xs font-medium text-gray-500">
                          Department:
                        </span>
                        <p className="text-sm text-gray-900">
                          {user.Department
                            ? `${user.Department.code} - ${user.Department.name}`
                            : "No Department"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-xs font-medium text-gray-500">
                            Last Login:
                          </span>
                          <p className="text-sm text-gray-900">
                            {formatLastLogin(user.last_login)}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-500">
                            Created:
                          </span>
                          <p className="text-sm text-gray-900">
                            {formatDate(user.created_at)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <div className="text-xs text-gray-500">
                          {user.permissions.length} permission
                          {user.permissions.length !== 1 ? "s" : ""}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowPermissionsModal(true);
                            }}
                            className="p-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-full"
                            title="Manage Permissions"
                          >
                            <Settings className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setShowUserForm(true);
                            }}
                            className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"
                            title="Edit User"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              toggleUserStatus(user.id, user.is_active)
                            }
                            className={`p-1 rounded-full hover:bg-gray-100 ${
                              user.is_active
                                ? "text-red-600 hover:text-red-700"
                                : "text-green-600 hover:text-green-700"
                            }`}
                            title={
                              user.is_active
                                ? "Deactivate User"
                                : "Activate User"
                            }
                          >
                            {user.is_active ? (
                              <Lock className="h-4 w-4" />
                            ) : (
                              <Unlock className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() =>
                      handleFilterChange("page", Math.max(1, filters.page - 1))
                    }
                    disabled={filters.page <= 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      handleFilterChange(
                        "page",
                        Math.min(pagination.totalPages, filters.page + 1)
                      )
                    }
                    disabled={filters.page >= pagination.totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {(filters.page - 1) * filters.limit + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(
                          filters.page * filters.limit,
                          pagination.total
                        )}
                      </span>{" "}
                      of <span className="font-medium">{pagination.total}</span>{" "}
                      results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() =>
                          handleFilterChange(
                            "page",
                            Math.max(1, filters.page - 1)
                          )
                        }
                        disabled={filters.page <= 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() =>
                          handleFilterChange(
                            "page",
                            Math.min(pagination.totalPages, filters.page + 1)
                          )
                        }
                        disabled={filters.page >= pagination.totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-6 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No users found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.search || filters.role || filters.department_id
                ? "Try adjusting your filters"
                : "Get started by adding your first user."}
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowUserForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Form Modal */}
      <UserForm
        isOpen={showUserForm}
        onClose={() => {
          setShowUserForm(false);
          setEditingUser(null);
        }}
        onSuccess={() => {
          loadUsers();
          setShowUserForm(false);
          setEditingUser(null);
        }}
        editingUser={editingUser}
      />

      {/* User Permissions Modal */}
      <UserPermissionsModal
        isOpen={showPermissionsModal}
        onClose={() => {
          setShowPermissionsModal(false);
          setSelectedUser(null);
        }}
        onSubmit={() => {
          loadUsers();
        }}
      />
    </div>
  );
};

export default PermissionManagement;
