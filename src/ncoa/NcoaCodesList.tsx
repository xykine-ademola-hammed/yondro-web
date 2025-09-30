import React, { useState, useEffect } from "react";
import { ncoaAPI } from "../services/api";
import {
  Search,
  Filter,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Building,
  Eye,
} from "lucide-react";
import { useAuth } from "../GlobalContexts/AuthContext";

interface NcoaCode {
  id: number;
  code: string;
  economic_type: string;
  fg_title: string;
  state_title: string;
  lg_title: string;
  account_type: string;
  level: number;
  type: string;
  is_active: boolean;
}

interface NcoaStats {
  totalCodes: number;
  byEconomicType: Array<{ economic_type: string; count: number }>;
  byLevel: Array<{ level: number; count: number }>;
  byAccountType: Array<{ account_type: string; count: number }>;
}

const NcoaCodesList: React.FC = () => {
  const { hasPermission } = useAuth();
  const [codes, setCodes] = useState<NcoaCode[]>([]);
  const [stats, setStats] = useState<NcoaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    economic_type: "",
    account_type: "",
    level: "",
    type: "",
    page: 1,
    limit: 50,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
  });
  const [selectedCode, setSelectedCode] = useState<NcoaCode | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadCodes();
    loadStats();
  }, [filters]);

  const loadCodes = async () => {
    try {
      setLoading(true);
      const response = await ncoaAPI.getCodes(filters);
      setCodes(response.codes || []);
      setPagination(
        response.pagination || { total: 0, totalPages: 0, currentPage: 1 }
      );
    } catch (error) {
      console.error("Failed to load NCOA codes:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await ncoaAPI.getStats();
      setStats(response);
    } catch (error) {
      console.error("Failed to load NCOA stats:", error);
    }
  };

  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
  };

  const getEconomicTypeIcon = (type: string) => {
    const icons = {
      Revenue: TrendingUp,
      Expenditures: TrendingDown,
      Assets: Building,
      Liabilities: BookOpen,
    };
    return icons[type as keyof typeof icons] || BookOpen;
  };

  const getEconomicTypeBadge = (type: string) => {
    const colors = {
      Revenue: "bg-green-100 text-green-800",
      Expenditures: "bg-red-100 text-red-800",
      Assets: "bg-blue-100 text-blue-800",
      Liabilities: "bg-purple-100 text-purple-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getLevelBadge = (level: number) => {
    const colors = {
      1: "bg-red-100 text-red-800",
      2: "bg-orange-100 text-orange-800",
      3: "bg-yellow-100 text-yellow-800",
      4: "bg-blue-100 text-blue-800",
      5: "bg-green-100 text-green-800",
    };
    return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      GENERAL: "bg-blue-100 text-blue-800",
      DETAIL: "bg-green-100 text-green-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (!hasPermission("view_ncoa") && !hasPermission("manage_votebook")) {
    return (
      <div className="text-center py-12">
        <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Access Denied
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          You don't have permission to view NCOA codes.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-1xl font-bold text-gray-900">
          NCOA Chart of Accounts
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Nigerian Chart of Accounts (NCOA) - Standardized government accounting
          codes
        </p>
      </div>

      {/* Summary Stats */}
      {stats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Codes
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalCodes}
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
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Revenue Codes
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.byEconomicType.find(
                        (t) => t.economic_type === "Revenue"
                      )?.count || 0}
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
                  <TrendingDown className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Expenditure Codes
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.byEconomicType.find(
                        (t) => t.economic_type === "Expenditures"
                      )?.count || 0}
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
                  <Building className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Asset Codes
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.byEconomicType.find(
                        (t) => t.economic_type === "Assets"
                      )?.count || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search codes..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Economic Type
            </label>
            <select
              value={filters.economic_type}
              onChange={(e) =>
                handleFilterChange("economic_type", e.target.value)
              }
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Types</option>
              <option value="Revenue">Revenue</option>
              <option value="Expenditures">Expenditures</option>
              <option value="Assets">Assets</option>
              <option value="Liabilities">Liabilities</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Type
            </label>
            <select
              value={filters.account_type}
              onChange={(e) =>
                handleFilterChange("account_type", e.target.value)
              }
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Account Types</option>
              <option value="REVENUE">Revenue</option>
              <option value="EXPENDITURE">Expenditure</option>
              <option value="ASSET">Asset</option>
              <option value="LIABILITY">Liability</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Level
            </label>
            <select
              value={filters.level}
              onChange={(e) => handleFilterChange("level", e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Levels</option>
              <option value="1">Level 1</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
              <option value="4">Level 4</option>
              <option value="5">Level 5</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Types</option>
              <option value="GENERAL">General</option>
              <option value="DETAIL">Detail</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={loadCodes}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* NCOA Codes List */}
      <div className="bg-white shadow-sm rounded-lg">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading NCOA codes...</p>
          </div>
        ) : codes.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Economic Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Federal Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      State Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Local Title
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {codes.map((code) => {
                    const Icon = getEconomicTypeIcon(code.economic_type);

                    return (
                      <tr key={code.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Icon className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {code.code}
                              </div>
                              <div className="text-sm text-gray-500">
                                {code.account_type}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEconomicTypeBadge(
                              code.economic_type
                            )}`}
                          >
                            {code.economic_type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {code.fg_title || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {code.state_title || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {code.lg_title || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelBadge(
                              code.level
                            )}`}
                          >
                            Level {code.level}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(
                              code.type
                            )}`}
                          >
                            {code.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedCode(code);
                              setShowDetailModal(true);
                            }}
                            className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden">
              <div className="space-y-4 p-4">
                {codes.map((code) => {
                  const Icon = getEconomicTypeIcon(code.economic_type);

                  return (
                    <div
                      key={code.id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <Icon className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {code.code}
                            </div>
                            <div className="text-sm text-gray-500">
                              {code.account_type}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEconomicTypeBadge(
                              code.economic_type
                            )}`}
                          >
                            {code.economic_type}
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelBadge(
                              code.level
                            )}`}
                          >
                            Level {code.level}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-medium text-gray-500">
                            Federal Title:
                          </span>
                          <p className="text-sm text-gray-900">
                            {code.fg_title || "N/A"}
                          </p>
                        </div>

                        <div>
                          <span className="text-xs font-medium text-gray-500">
                            State Title:
                          </span>
                          <p className="text-sm text-gray-900">
                            {code.state_title || "N/A"}
                          </p>
                        </div>

                        <div>
                          <span className="text-xs font-medium text-gray-500">
                            Local Title:
                          </span>
                          <p className="text-sm text-gray-900">
                            {code.lg_title || "N/A"}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(
                              code.type
                            )}`}
                          >
                            {code.type}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedCode(code);
                              setShowDetailModal(true);
                            }}
                            className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No NCOA codes found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.search ||
              filters.economic_type ||
              filters.account_type ||
              filters.level ||
              filters.type
                ? "Try adjusting your filters"
                : "NCOA codes will appear here when loaded."}
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedCode && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  NCOA Code Details: {selectedCode.code}
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Eye className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Code</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900">
                      {selectedCode.code}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Economic Type
                    </dt>
                    <dd className="mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEconomicTypeBadge(
                          selectedCode.economic_type
                        )}`}
                      >
                        {selectedCode.economic_type}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Account Type
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {selectedCode.account_type || "N/A"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Level</dt>
                    <dd className="mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelBadge(
                          selectedCode.level
                        )}`}
                      >
                        Level {selectedCode.level}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Type</dt>
                    <dd className="mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(
                          selectedCode.type
                        )}`}
                      >
                        {selectedCode.type}
                      </span>
                    </dd>
                  </div>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Federal Government Title
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedCode.fg_title || "N/A"}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    State Government Title
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedCode.state_title || "N/A"}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Local Government Title
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedCode.lg_title || "N/A"}
                  </dd>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NcoaCodesList;
