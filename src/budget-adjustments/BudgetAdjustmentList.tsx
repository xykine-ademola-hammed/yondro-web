import React, { useState, useEffect } from "react";
import { budgetAdjustmentAPI } from "../services/api";
import {
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Calendar,
  User,
  DollarSign,
  AlertTriangle,
  Eye,
  FileText,
} from "lucide-react";
import { useAuth } from "../GlobalContexts/AuthContext";

interface BudgetAdjustment {
  id: number;
  reference_number: string;
  adjustment_type: string;
  amount: number;
  status: string;
  justification: string;
  effective_date: string;
  created_at: string;
  fromAccount?: {
    code: string;
    name: string;
  };
  toAccount: {
    code: string;
    name: string;
  };
  requestor: {
    first_name: string;
    last_name: string;
    email: string;
  };
  approver?: {
    first_name: string;
    last_name: string;
  };
  approval_date?: string;
  posted_date?: string;
}

const BudgetAdjustmentList: React.FC = () => {
  const { hasPermission } = useAuth();
  const [adjustments, setAdjustments] = useState<BudgetAdjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    adjustment_type: "",
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
  });
  const [selectedAdjustment, setSelectedAdjustment] =
    useState<BudgetAdjustment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | "post">(
    "approve"
  );
  const [actionComment, setActionComment] = useState("");

  useEffect(() => {
    loadAdjustments();
  }, [filters]);

  const loadAdjustments = async () => {
    try {
      setLoading(true);
      const response = await budgetAdjustmentAPI.getAdjustments(filters);
      setAdjustments(response.adjustments || []);
      setPagination(
        response.pagination || { total: 0, totalPages: 0, currentPage: 1 }
      );
    } catch (error) {
      console.error("Failed to load budget adjustments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
  };

  const handleAction = async () => {
    if (!selectedAdjustment) return;

    try {
      setActionLoading(selectedAdjustment.id);

      switch (actionType) {
        case "approve":
          await budgetAdjustmentAPI.approveAdjustment(selectedAdjustment.id, {
            comment: actionComment,
          });
          break;
        case "reject":
          await budgetAdjustmentAPI.rejectAdjustment(selectedAdjustment.id, {
            comment: actionComment,
          });
          break;
        case "post":
          await budgetAdjustmentAPI.postAdjustment(selectedAdjustment.id);
          break;
      }

      await loadAdjustments();
      setShowActionModal(false);
      setActionComment("");
      setSelectedAdjustment(null);
    } catch (error: any) {
      console.error(`Failed to ${actionType} adjustment:`, error);
      alert(error.message || `Failed to ${actionType} adjustment`);
    } finally {
      setActionLoading(null);
    }
  };

  const openActionModal = (
    adjustment: BudgetAdjustment,
    action: "approve" | "reject" | "post"
  ) => {
    setSelectedAdjustment(adjustment);
    setActionType(action);
    setShowActionModal(true);
  };

  const getAdjustmentTypeIcon = (type: string) => {
    const icons = {
      SUPPLEMENT: TrendingUp,
      REDUCTION: TrendingDown,
      TRANSFER: ArrowRightLeft,
      CARRYFORWARD: Plus,
      REVERSAL: TrendingUp,
    };
    return icons[type as keyof typeof icons] || Plus;
  };

  const getAdjustmentTypeColor = (type: string) => {
    const colors = {
      SUPPLEMENT: "text-green-600 bg-green-100",
      REDUCTION: "text-red-600 bg-red-100",
      TRANSFER: "text-blue-600 bg-blue-100",
      CARRYFORWARD: "text-purple-600 bg-purple-100",
      REVERSAL: "text-orange-600 bg-orange-100",
    };
    return colors[type as keyof typeof colors] || "text-gray-600 bg-gray-100";
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Pending",
        icon: Clock,
      },
      APPROVED: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Approved",
        icon: CheckCircle,
      },
      REJECTED: {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "Rejected",
        icon: XCircle,
      },
      POSTED: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Posted",
        icon: CheckCircle,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const canApprove = (adjustment: BudgetAdjustment) => {
    return hasPermission("approve_budget") && adjustment.status === "PENDING";
  };

  const canPost = (adjustment: BudgetAdjustment) => {
    return hasPermission("post_budget") && adjustment.status === "APPROVED";
  };

  const getActionButtons = (adjustment: BudgetAdjustment) => {
    const buttons = [];

    if (canApprove(adjustment)) {
      buttons.push(
        <button
          key="reject"
          onClick={() => openActionModal(adjustment, "reject")}
          className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
          title="Reject"
        >
          <XCircle className="h-4 w-4" />
        </button>,
        <button
          key="approve"
          onClick={() => openActionModal(adjustment, "approve")}
          className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full"
          title="Approve"
        >
          <CheckCircle className="h-4 w-4" />
        </button>
      );
    }

    if (canPost(adjustment)) {
      buttons.push(
        <button
          key="post"
          onClick={() => openActionModal(adjustment, "post")}
          className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"
          title="Post to Vote Book"
        >
          <FileText className="h-4 w-4" />
        </button>
      );
    }

    buttons.push(
      <button
        key="view"
        onClick={() => {
          setSelectedAdjustment(adjustment);
          setShowDetailModal(true);
        }}
        className="p-1 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-full"
        title="View Details"
      >
        <Eye className="h-4 w-4" />
      </button>
    );

    return buttons;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-1xl font-bold text-gray-900">Budget Adjustments</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage budget supplements, transfers, and other fund adjustments
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {adjustments.filter((a) => a.status === "PENDING").length}
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
                    Approved
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {adjustments.filter((a) => a.status === "APPROVED").length}
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
                <FileText className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Posted
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {adjustments.filter((a) => a.status === "POSTED").length}
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
                <DollarSign className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Value
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(
                      adjustments.reduce(
                        (sum, adj) => sum + parseFloat(adj.amount.toString()),
                        0
                      )
                    )}
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
                placeholder="Search adjustments..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="POSTED">Posted</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={filters.adjustment_type}
              onChange={(e) =>
                handleFilterChange("adjustment_type", e.target.value)
              }
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Types</option>
              <option value="SUPPLEMENT">Supplement</option>
              <option value="REDUCTION">Reduction</option>
              <option value="TRANSFER">Transfer</option>
              <option value="CARRYFORWARD">Carry Forward</option>
              <option value="REVERSAL">Reversal</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={loadAdjustments}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Adjustments List */}
      <div className="bg-white shadow-sm rounded-lg">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">
              Loading budget adjustments...
            </p>
          </div>
        ) : adjustments.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Accounts
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requestor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {adjustments.map((adjustment) => {
                    const Icon = getAdjustmentTypeIcon(
                      adjustment.adjustment_type
                    );
                    const typeColor = getAdjustmentTypeColor(
                      adjustment.adjustment_type
                    );

                    return (
                      <tr key={adjustment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {adjustment.reference_number}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {adjustment.justification}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColor}`}
                          >
                            <Icon className="h-3 w-3 mr-1" />
                            {adjustment.adjustment_type.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {adjustment.fromAccount && (
                              <div className="text-xs text-gray-500">
                                From: {adjustment.fromAccount.code} -{" "}
                                {adjustment.fromAccount.name}
                              </div>
                            )}
                            <div className="text-xs text-gray-900">
                              To: {adjustment.toAccount.code} -{" "}
                              {adjustment.toAccount.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                          {formatCurrency(adjustment.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(adjustment.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm text-gray-900">
                                {adjustment.requestor.first_name}{" "}
                                {adjustment.requestor.last_name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {adjustment.requestor.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm text-gray-900">
                                {formatDate(adjustment.effective_date)}
                              </div>
                              <div className="text-xs text-gray-500">
                                Created: {formatDate(adjustment.created_at)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-1">
                            {getActionButtons(adjustment)}
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
                {adjustments.map((adjustment) => {
                  const Icon = getAdjustmentTypeIcon(
                    adjustment.adjustment_type
                  );
                  const typeColor = getAdjustmentTypeColor(
                    adjustment.adjustment_type
                  );

                  return (
                    <div
                      key={adjustment.id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {adjustment.reference_number}
                          </div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColor} mt-1`}
                          >
                            <Icon className="h-3 w-3 mr-1" />
                            {adjustment.adjustment_type.replace("_", " ")}
                          </span>
                        </div>
                        <div className="flex flex-col space-y-1">
                          {getStatusBadge(adjustment.status)}
                          <div className="text-right text-sm font-medium text-gray-900">
                            {formatCurrency(adjustment.amount)}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-medium text-gray-500">
                            Justification:
                          </span>
                          <p className="text-sm text-gray-900 truncate">
                            {adjustment.justification}
                          </p>
                        </div>

                        <div>
                          <span className="text-xs font-medium text-gray-500">
                            Accounts:
                          </span>
                          {adjustment.fromAccount && (
                            <p className="text-xs text-gray-500">
                              From: {adjustment.fromAccount.code} -{" "}
                              {adjustment.fromAccount.name}
                            </p>
                          )}
                          <p className="text-xs text-gray-900">
                            To: {adjustment.toAccount.code} -{" "}
                            {adjustment.toAccount.name}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-gray-500">
                            <User className="h-3 w-3 mr-1" />
                            {adjustment.requestor.first_name}{" "}
                            {adjustment.requestor.last_name}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(adjustment.effective_date)}
                          </div>
                        </div>

                        <div className="flex items-center justify-end space-x-1 pt-2 border-t border-gray-200">
                          {getActionButtons(adjustment)}
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
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No budget adjustments found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.search || filters.status || filters.adjustment_type
                ? "Try adjusting your filters"
                : "Budget adjustments will appear here when created."}
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedAdjustment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Budget Adjustment Details
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Reference Number
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {selectedAdjustment.reference_number}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Type</dt>
                    <dd className="mt-1">
                      {(() => {
                        const Icon = getAdjustmentTypeIcon(
                          selectedAdjustment.adjustment_type
                        );
                        const typeColor = getAdjustmentTypeColor(
                          selectedAdjustment.adjustment_type
                        );
                        return (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColor}`}
                          >
                            <Icon className="h-3 w-3 mr-1" />
                            {selectedAdjustment.adjustment_type.replace(
                              "_",
                              " "
                            )}
                          </span>
                        );
                      })()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Amount
                    </dt>
                    <dd className="mt-1 text-lg font-semibold text-gray-900">
                      {formatCurrency(selectedAdjustment.amount)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Status
                    </dt>
                    <dd className="mt-1">
                      {getStatusBadge(selectedAdjustment.status)}
                    </dd>
                  </div>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Justification
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedAdjustment.justification}
                  </dd>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {selectedAdjustment.fromAccount && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Source Account
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {selectedAdjustment.fromAccount.code} -{" "}
                        {selectedAdjustment.fromAccount.name}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Destination Account
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {selectedAdjustment.toAccount.code} -{" "}
                      {selectedAdjustment.toAccount.name}
                    </dd>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Effective Date
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(selectedAdjustment.effective_date)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Created Date
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(selectedAdjustment.created_at)}
                    </dd>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Requestor
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {selectedAdjustment.requestor.first_name}{" "}
                      {selectedAdjustment.requestor.last_name}
                    </dd>
                  </div>
                  {selectedAdjustment.approver && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Approver
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {selectedAdjustment.approver.first_name}{" "}
                        {selectedAdjustment.approver.last_name}
                      </dd>
                    </div>
                  )}
                </div>

                {selectedAdjustment.approval_date && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Approval Date
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(selectedAdjustment.approval_date)}
                    </dd>
                  </div>
                )}

                {selectedAdjustment.posted_date && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Posted Date
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(selectedAdjustment.posted_date)}
                    </dd>
                  </div>
                )}
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

      {/* Action Modal */}
      {showActionModal && selectedAdjustment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-center mx-auto w-12 h-12 rounded-full bg-blue-100">
                {actionType === "approve" && (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                )}
                {actionType === "reject" && (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
                {actionType === "post" && (
                  <FileText className="h-6 w-6 text-blue-600" />
                )}
              </div>
              <div className="mt-5 text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  {actionType === "approve" && "Approve Budget Adjustment"}
                  {actionType === "reject" && "Reject Budget Adjustment"}
                  {actionType === "post" && "Post Budget Adjustment"}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {selectedAdjustment.reference_number} -{" "}
                  {formatCurrency(selectedAdjustment.amount)}
                </p>

                {actionType !== "post" && (
                  <div className="mt-4">
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder={`Add ${actionType} comment (optional)`}
                      value={actionComment}
                      onChange={(e) => setActionComment(e.target.value)}
                    />
                  </div>
                )}

                {actionType === "post" && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      <div className="ml-3">
                        <p className="text-sm text-yellow-800">
                          This will execute the fund movement and cannot be
                          undone.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-center space-x-3">
                  <button
                    onClick={() => setShowActionModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAction}
                    disabled={actionLoading === selectedAdjustment.id}
                    className={`px-4 py-2 rounded-md text-white disabled:opacity-50 ${
                      actionType === "approve"
                        ? "bg-green-600 hover:bg-green-700"
                        : actionType === "reject"
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {actionLoading === selectedAdjustment.id
                      ? "Processing..."
                      : actionType === "approve"
                      ? "Approve"
                      : actionType === "reject"
                      ? "Reject"
                      : "Post"}
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

export default BudgetAdjustmentList;
