import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { voucherAPI } from "../services/api";
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  DollarSign,
  Calendar,
} from "lucide-react";
import { useAuth } from "../GlobalContexts/AuthContext";

interface PendingVoucher {
  id: number;
  voucher_number: string;
  payee_name: string;
  purpose: string;
  total_amount: number;
  currency: string;
  status: string;
  priority: string;
  created_at: string;
  requester: {
    first_name: string;
    last_name: string;
  };
}

const ApprovalQueue: React.FC = () => {
  const { user } = useAuth();
  const [pendingVouchers, _setPendingVouchers] = useState<PendingVoucher[]>([]);
  const [loading, _setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    loadPendingVouchers();
  }, []);

  const loadPendingVouchers = async () => {};

  const quickApprove = async (voucherId: number) => {
    try {
      setActionLoading(voucherId);
      await voucherAPI.approveVoucher(voucherId, {
        comment: "Quick approved from queue",
      });
      await loadPendingVouchers();
    } catch (error) {
      console.error("Failed to approve voucher:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const quickReject = async (voucherId: number) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) return;

    try {
      setActionLoading(voucherId);
      await voucherAPI.rejectVoucher(voucherId, {
        reason,
        comment: "Quick rejected from queue",
      });
      await loadPendingVouchers();
    } catch (error) {
      console.error("Failed to reject voucher:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      submitted: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Awaiting L1",
      },
      approved_l1: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Awaiting L2",
      },
      approved_l2: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Awaiting L3",
      },
      approved_l3: {
        bg: "bg-orange-100",
        text: "text-orange-800",
        label: "Awaiting Finance",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
      label: status,
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { bg: "bg-gray-100", text: "text-gray-800" },
      medium: { bg: "bg-blue-100", text: "text-blue-800" },
      high: { bg: "bg-orange-100", text: "text-orange-800" },
      urgent: { bg: "bg-red-100", text: "text-red-800" },
    };

    const config =
      priorityConfig[priority as keyof typeof priorityConfig] ||
      priorityConfig.medium;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text} capitalize`}
      >
        {priority}
      </span>
    );
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const voucherDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - voucherDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays <= 7) {
      return `${diffDays} days ago`;
    } else {
      return voucherDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Approval Queue</h1>
        <p className="mt-1 text-sm text-gray-600">
          Review and approve pending vouchers requiring your attention
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {pendingVouchers.length}
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
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Value
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(
                      pendingVouchers.reduce(
                        (sum, v) => sum + parseFloat(v.total_amount.toString()),
                        0
                      )
                    )}
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
                <FileText className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Urgent
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {
                      pendingVouchers.filter((v) => v.priority === "urgent")
                        .length
                    }
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
                <User className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    My Level
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 capitalize">
                    {user?.role
                      ?.replace("approver_", "L")
                      .replace("finance_officer", "Finance")}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vouchers List */}
      <div className="bg-white shadow-sm rounded-lg">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">
              Loading pending vouchers...
            </p>
          </div>
        ) : pendingVouchers.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Voucher
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingVouchers.map((voucher) => (
                    <tr key={voucher.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <Link
                              to={`/vouchers/${voucher.id}`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-500"
                            >
                              {voucher.voucher_number}
                            </Link>
                            <p className="text-sm text-gray-500 max-w-xs truncate">
                              {voucher.purpose}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {voucher.payee_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          by {voucher.requester.first_name}{" "}
                          {voucher.requester.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(
                            voucher.total_amount,
                            voucher.currency
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(voucher.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPriorityBadge(voucher.priority)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-500">
                            {formatDate(voucher.created_at)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => quickReject(voucher.id)}
                            disabled={actionLoading === voucher.id}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full disabled:opacity-50"
                            title="Quick Reject"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => quickApprove(voucher.id)}
                            disabled={actionLoading === voucher.id}
                            className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full disabled:opacity-50"
                            title="Quick Approve"
                          >
                            {actionLoading === voucher.id ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                            ) : (
                              <CheckCircle className="h-5 w-5" />
                            )}
                          </button>
                          <Link
                            to={`/vouchers/${voucher.id}`}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            View Details
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden">
              <div className="space-y-4 p-4">
                {pendingVouchers.map((voucher) => (
                  <div
                    key={voucher.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-2" />
                        <Link
                          to={`/vouchers/${voucher.id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                          {voucher.voucher_number}
                        </Link>
                      </div>
                      <div className="flex space-x-2">
                        {getStatusBadge(voucher.status)}
                        {getPriorityBadge(voucher.priority)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="text-xs font-medium text-gray-500">
                          Payee:
                        </span>
                        <p className="text-sm text-gray-900">
                          {voucher.payee_name}
                        </p>
                      </div>

                      <div>
                        <span className="text-xs font-medium text-gray-500">
                          Purpose:
                        </span>
                        <p className="text-sm text-gray-900 truncate">
                          {voucher.purpose}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(
                              voucher.total_amount,
                              voucher.currency
                            )}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(voucher.created_at)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-500">
                          <User className="h-3 w-3 mr-1" />
                          {voucher.requester.first_name}{" "}
                          {voucher.requester.last_name}
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => quickReject(voucher.id)}
                            disabled={actionLoading === voucher.id}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full disabled:opacity-50"
                            title="Quick Reject"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => quickApprove(voucher.id)}
                            disabled={actionLoading === voucher.id}
                            className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full disabled:opacity-50"
                            title="Quick Approve"
                          >
                            {actionLoading === voucher.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="p-6 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              All caught up!
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              There are no vouchers pending your approval at this time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalQueue;
