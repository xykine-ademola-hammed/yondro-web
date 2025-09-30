import React, { useState, useEffect } from "react";
import { fiscalYearAPI } from "../services/api";
import {
  Calendar,
  Plus,
  Edit,
  Lock,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  Clock,
} from "lucide-react";
import FiscalYearForm from "./FiscalYearForm";
import { useAuth } from "../GlobalContexts/AuthContext";

interface FiscalYear {
  id: number;
  year: number;
  start_date: string;
  end_date: string;
  is_current: boolean;
  is_closed: boolean;
  created_at: string;
  updated_at: string;
  Organization: {
    name: string;
    code: string;
  };
}

const FiscalYearManagement: React.FC = () => {
  const { hasPermission } = useAuth();
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    is_current: "",
    is_closed: "",
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFiscalYear, setEditingFiscalYear] = useState<FiscalYear | null>(
    null
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "close" | "setCurrent";
    fiscalYear: FiscalYear;
  } | null>(null);

  useEffect(() => {
    loadFiscalYears();
  }, [filters]);

  const loadFiscalYears = async () => {
    try {
      setLoading(true);
      const response = await fiscalYearAPI.getFiscalYears(filters);
      setFiscalYears(response.fiscalYears || []);
      setPagination(
        response.pagination || { total: 0, totalPages: 0, currentPage: 1 }
      );
    } catch (error) {
      console.error("Failed to load fiscal years:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
  };

  const handleCloseFiscalYear = async (fiscalYear: FiscalYear) => {
    try {
      setActionLoading(fiscalYear.id);
      await fiscalYearAPI.closeFiscalYear(fiscalYear.id);
      await loadFiscalYears();
      setShowConfirmModal(false);
      setConfirmAction(null);
    } catch (error: any) {
      console.error("Failed to close fiscal year:", error);
      alert(error.message || "Failed to close fiscal year");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetCurrent = async (fiscalYear: FiscalYear) => {
    try {
      setActionLoading(fiscalYear.id);
      await fiscalYearAPI.setCurrentFiscalYear(fiscalYear.id);
      await loadFiscalYears();
      setShowConfirmModal(false);
      setConfirmAction(null);
    } catch (error: any) {
      console.error("Failed to set current fiscal year:", error);
      alert(error.message || "Failed to set current fiscal year");
    } finally {
      setActionLoading(null);
    }
  };

  const openConfirmModal = (
    type: "close" | "setCurrent",
    fiscalYear: FiscalYear
  ) => {
    setConfirmAction({ type, fiscalYear });
    setShowConfirmModal(true);
  };

  const getStatusBadge = (fiscalYear: FiscalYear) => {
    if (fiscalYear.is_current) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Current
        </span>
      );
    }

    if (fiscalYear.is_closed) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <Lock className="h-3 w-3 mr-1" />
          Closed
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <Clock className="h-3 w-3 mr-1" />
        Open
      </span>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start.getFullYear() === end.getFullYear()) {
      return `${start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${end.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    }

    return `${start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })} - ${end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  };

  const canEdit = (fiscalYear: FiscalYear) => {
    return hasPermission("manage_fiscal_years") && !fiscalYear.is_closed;
  };

  const canClose = (fiscalYear: FiscalYear) => {
    return hasPermission("close_fiscal_year") && !fiscalYear.is_closed;
  };

  const canSetCurrent = (fiscalYear: FiscalYear) => {
    return (
      hasPermission("manage_fiscal_years") &&
      !fiscalYear.is_current &&
      !fiscalYear.is_closed
    );
  };

  if (
    !hasPermission("view_fiscal_years") &&
    !hasPermission("manage_fiscal_years")
  ) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Access Denied
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          You don't have permission to view fiscal years.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-1xl font-bold text-gray-900">
            Fiscal Year Management
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage fiscal years, periods, and budget cycles
          </p>
        </div>
        {hasPermission("manage_fiscal_years") && (
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Fiscal Year
            </button>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Years
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {fiscalYears.length}
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
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Current Year
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {fiscalYears.find((fy) => fy.is_current)?.year || "None"}
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
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Open Years
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {fiscalYears.filter((fy) => !fy.is_closed).length}
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
                <Lock className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Closed Years
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {fiscalYears.filter((fy) => fy.is_closed).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search fiscal years..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Status
            </label>
            <select
              value={filters.is_current}
              onChange={(e) => handleFilterChange("is_current", e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Years</option>
              <option value="true">Current Year</option>
              <option value="false">Non-Current</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Closed Status
            </label>
            <select
              value={filters.is_closed}
              onChange={(e) => handleFilterChange("is_closed", e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Status</option>
              <option value="false">Open</option>
              <option value="true">Closed</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={loadFiscalYears}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Fiscal Years List */}
      <div className="bg-white shadow-sm rounded-lg">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">
              Loading fiscal years...
            </p>
          </div>
        ) : fiscalYears.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fiscal Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
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
                  {fiscalYears.map((fiscalYear) => {
                    const startDate = new Date(fiscalYear.start_date);
                    const endDate = new Date(fiscalYear.end_date);
                    const durationDays = Math.ceil(
                      (endDate.getTime() - startDate.getTime()) /
                        (1000 * 60 * 60 * 24)
                    );

                    return (
                      <tr key={fiscalYear.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                FY {fiscalYear.year}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDateRange(
                              fiscalYear.start_date,
                              fiscalYear.end_date
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(fiscalYear)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {durationDays} days
                          </div>
                          <div className="text-sm text-gray-500">
                            {Math.round(durationDays / 30.44)} months
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatDate(fiscalYear.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            {canSetCurrent(fiscalYear) && (
                              <button
                                onClick={() =>
                                  openConfirmModal("setCurrent", fiscalYear)
                                }
                                disabled={actionLoading === fiscalYear.id}
                                className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full disabled:opacity-50"
                                title="Set as Current"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}

                            {canEdit(fiscalYear) && (
                              <button
                                onClick={() => {
                                  setEditingFiscalYear(fiscalYear);
                                  setShowCreateForm(true);
                                }}
                                className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"
                                title="Edit Fiscal Year"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}

                            {canClose(fiscalYear) && (
                              <button
                                onClick={() =>
                                  openConfirmModal("close", fiscalYear)
                                }
                                disabled={actionLoading === fiscalYear.id}
                                className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full disabled:opacity-50"
                                title="Close Fiscal Year"
                              >
                                {actionLoading === fiscalYear.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                ) : (
                                  <Lock className="h-4 w-4" />
                                )}
                              </button>
                            )}
                          </div>
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
                {fiscalYears.map((fiscalYear) => {
                  const startDate = new Date(fiscalYear.start_date);
                  const endDate = new Date(fiscalYear.end_date);
                  const durationDays = Math.ceil(
                    (endDate.getTime() - startDate.getTime()) /
                      (1000 * 60 * 60 * 24)
                  );

                  return (
                    <div
                      key={fiscalYear.id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              FY {fiscalYear.year}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          {getStatusBadge(fiscalYear)}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-medium text-gray-500">
                            Period:
                          </span>
                          <p className="text-sm text-gray-900">
                            {formatDateRange(
                              fiscalYear.start_date,
                              fiscalYear.end_date
                            )}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-xs font-medium text-gray-500">
                              Duration:
                            </span>
                            <p className="text-sm text-gray-900">
                              {durationDays} days
                            </p>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-gray-500">
                              Created:
                            </span>
                            <p className="text-sm text-gray-900">
                              {formatDate(fiscalYear.created_at)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-200">
                          {canSetCurrent(fiscalYear) && (
                            <button
                              onClick={() =>
                                openConfirmModal("setCurrent", fiscalYear)
                              }
                              disabled={actionLoading === fiscalYear.id}
                              className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full disabled:opacity-50"
                              title="Set as Current"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}

                          {canEdit(fiscalYear) && (
                            <button
                              onClick={() => {
                                setEditingFiscalYear(fiscalYear);
                                setShowCreateForm(true);
                              }}
                              className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"
                              title="Edit Fiscal Year"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}

                          {canClose(fiscalYear) && (
                            <button
                              onClick={() =>
                                openConfirmModal("close", fiscalYear)
                              }
                              disabled={actionLoading === fiscalYear.id}
                              className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full disabled:opacity-50"
                              title="Close Fiscal Year"
                            >
                              {actionLoading === fiscalYear.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                              ) : (
                                <Lock className="h-4 w-4" />
                              )}
                            </button>
                          )}
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
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No fiscal years found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.search || filters.is_current || filters.is_closed
                ? "Try adjusting your filters"
                : "Get started by creating your first fiscal year."}
            </p>
            {hasPermission("manage_fiscal_years") &&
              !filters.search &&
              !filters.is_current &&
              !filters.is_closed && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Fiscal Year
                  </button>
                </div>
              )}
          </div>
        )}
      </div>

      {/* Fiscal Year Form Modal */}
      <FiscalYearForm
        isOpen={showCreateForm}
        onClose={() => {
          setShowCreateForm(false);
          setEditingFiscalYear(null);
        }}
        onSuccess={() => {
          loadFiscalYears();
          setShowCreateForm(false);
          setEditingFiscalYear(null);
        }}
        editingFiscalYear={editingFiscalYear}
      />

      {/* Confirmation Modal */}
      {showConfirmModal && confirmAction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-center mx-auto w-12 h-12 rounded-full bg-yellow-100">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="mt-5 text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  {confirmAction.type === "close"
                    ? "Close Fiscal Year"
                    : "Set Current Fiscal Year"}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {confirmAction.type === "close"
                    ? `Are you sure you want to close FY ${confirmAction.fiscalYear.year}? This action cannot be undone and will prevent any new transactions.`
                    : `Are you sure you want to set FY ${confirmAction.fiscalYear.year} as the current fiscal year? This will change the active budget period.`}
                </p>

                <div className="mt-6 flex justify-center space-x-3">
                  <button
                    onClick={() => {
                      setShowConfirmModal(false);
                      setConfirmAction(null);
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (confirmAction.type === "close") {
                        handleCloseFiscalYear(confirmAction.fiscalYear);
                      } else {
                        handleSetCurrent(confirmAction.fiscalYear);
                      }
                    }}
                    disabled={actionLoading === confirmAction.fiscalYear.id}
                    className={`px-4 py-2 rounded-md text-white disabled:opacity-50 ${
                      confirmAction.type === "close"
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {actionLoading === confirmAction.fiscalYear.id
                      ? "Processing..."
                      : confirmAction.type === "close"
                      ? "Close Year"
                      : "Set Current"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FiscalYearManagement;
