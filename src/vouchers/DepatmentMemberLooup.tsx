import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, Check, User } from "lucide-react";
import { useAuth } from "../GlobalContexts/AuthContext";
import type { ApiFilter } from "../common/types";
import { useMutation } from "@tanstack/react-query";
import { getMutationMethod } from "../common/api-methods";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  Department?: {
    name: string;
    code: string;
  };
}

interface DepartmentMemberLookupProps {
  onSelect: (user: User) => void;
  selectedUserId?: string | null;
  className?: string;
  error?: string;
  label: string;
  placeholder?: string;
  roleFilter?: string[];
}

const DepartmentMemberLookup: React.FC<DepartmentMemberLookupProps> = ({
  onSelect,
  className = "",
  error,
  label,
  placeholder = "Select user...",
  roleFilter,
}) => {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const departmentEmployeeFilter: ApiFilter = {
    filters: [
      {
        key: "organizationId",
        value: user?.organizationId || "",
        condition: "equal",
      },
      {
        key: "schoolOrOfficeId",
        value: user?.schoolOrOfficeId || "",
        condition: "equal",
      },
    ],
    limit: 10000,
    offset: 0,
  };

  const { mutateAsync: fetchDepartmentEmployees } = useMutation({
    mutationFn: (body: ApiFilter) =>
      getMutationMethod("POST", `api/employees/get-employees`, body, true),
    onSuccess: (data) => {
      setUsers(data?.rows);
    },
    onError: (error) => {
      console.error("Failed to fetch positions:", error);
    },
  });

  const loadUsers = async () => {
    try {
      if (user?.organizationId && user.schoolOrOfficeId) {
        fetchDepartmentEmployees(departmentEmployeeFilter);
      }
      setLoading(true);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by role if specified
    if (roleFilter && roleFilter.length > 0) {
      filtered = filtered.filter((user) => roleFilter.includes(user.role));
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((user) => {
        const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
        return (
          fullName.includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.role.toLowerCase().includes(searchLower)
        );
      });
    }

    setFilteredUsers(filtered);
  };

  const handleUserSelect = (user: User) => {
    onSelect(user);
    setSelectedUser(user);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
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
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      {/* Selected User Display */}
      <button
        type="button"
        onClick={handleOpen}
        className={`relative w-full bg-white border rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
          error ? "border-red-300" : "border-gray-300"
        }`}
      >
        {selectedUser ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-sm font-medium text-gray-900">
                {selectedUser.first_name} {selectedUser.last_name}
              </div>
              {/* <div className="text-xs text-gray-500">
                  {selectedUser.position.title}
                </div> */}
            </div>
          </div>
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDown className="h-5 w-5 text-gray-400" />
        </span>
      </button>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-80 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {/* Search */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-3">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search users by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            {roleFilter && roleFilter.length > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                Filtered by roles:{" "}
                {roleFilter.map((role) => role.replace("_", " ")).join(", ")}
              </div>
            )}
          </div>

          {/* Results */}
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="px-3 py-4 text-sm text-gray-500 flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Loading users...
              </div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleUserSelect(user)}
                  className="w-full text-left px-3 py-3 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {user.email}
                        </div>
                        {user.Department && (
                          <div className="text-xs text-gray-400">
                            {user.Department.code} - {user.Department.name}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      {getRoleBadge(user.role)}
                      {selectedUser?.id === user.id && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                {searchTerm
                  ? "No users found matching your search"
                  : "No users available"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentMemberLookup;
