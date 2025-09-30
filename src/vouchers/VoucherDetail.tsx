import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { voucherAPI } from "../services/api";
import {
  FileText,
  User,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "../GlobalContexts/AuthContext";

interface VoucherDetail {
  id: number;
  voucher_number: string;
  payee_name: string;
  payee_address?: string;
  purpose: string;
  total_amount: number;
  tax_amount: number;
  net_amount: number;
  currency: string;
  status: string;
  priority: string;
  due_date?: string;
  invoice_number?: string;
  po_number?: string;
  notes?: string;
  created_at: string;
  requester: {
    first_name: string;
    last_name: string;
    email: string;
  };
  VoucherLines: Array<{
    id: number;
    description: string;
    quantity: number;
    unit_cost: number;
    total_amount: number;
    tax_amount: number;
    VoteBookAccount: {
      code: string;
      name: string;
    };
  }>;
  ApprovalActions: Array<{
    id: number;
    level: number;
    action: string;
    comment?: string;
    decision_date: string;
    actor: {
      first_name: string;
      last_name: string;
    };
  }>;
}

const VoucherDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [voucher, setVoucher] = useState<VoucherDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionComment, setActionComment] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (id) {
      loadVoucher();
    }
  }, [id]);

  const loadVoucher = async () => {
    try {
      setLoading(true);
      const response = await voucherAPI.getVoucher(Number(id));
      setVoucher(response);
    } catch (error: any) {
      setError(error.message || "Failed to load voucher");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!voucher) return;

    try {
      setActionLoading(true);
      await voucherAPI.submitVoucher(voucher.id);
      await loadVoucher();
    } catch (error: any) {
      setError(error.message || "Failed to submit voucher");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!voucher) return;

    try {
      setActionLoading(true);
      await voucherAPI.approveVoucher(voucher.id, {
        comment: actionComment,
      });
      await loadVoucher();
      setShowApprovalModal(false);
      setActionComment("");
    } catch (error: any) {
      setError(error.message || "Failed to approve voucher");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!voucher) return;

    try {
      setActionLoading(true);
      await voucherAPI.rejectVoucher(voucher.id, {
        comment: actionComment,
        reason: rejectReason,
      });
      await loadVoucher();
      setShowRejectModal(false);
      setActionComment("");
      setRejectReason("");
    } catch (error: any) {
      setError(error.message || "Failed to reject voucher");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        label: "Draft",
        icon: FileText,
      },
      submitted: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Submitted",
        icon: Clock,
      },
      approved_l1: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "L1 Approved",
        icon: Clock,
      },
      approved_l2: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "L2 Approved",
        icon: Clock,
      },
      approved_l3: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "L3 Approved",
        icon: Clock,
      },
      finance_approved: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Approved",
        icon: CheckCircle,
      },
      posted: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Posted",
        icon: CheckCircle,
      },
      paid: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Paid",
        icon: CheckCircle,
      },
      rejected: {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "Rejected",
        icon: XCircle,
      },
      cancelled: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        label: "Cancelled",
        icon: XCircle,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
      >
        <Icon className="h-4 w-4 mr-1" />
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
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canApprove = () => {
    if (!voucher) return false;

    const approverRoles = [
      "approver_l1",
      "approver_l2",
      "approver_l3",
      "finance_officer",
    ];
    if (!hasRole(approverRoles)) return false;

    const approvableStatuses = [
      "submitted",
      "approved_l1",
      "approved_l2",
      "approved_l3",
    ];
    return approvableStatuses.includes(voucher.status);
  };

  const canSubmit = () => {
    if (!voucher) return false;
    return (
      voucher.status === "draft" && voucher.requester?.email === user?.email
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!voucher) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Voucher not found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          The voucher you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate("/vouchers")}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Voucher {voucher.voucher_number}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Created {formatDate(voucher.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {getStatusBadge(voucher.status)}
            {getPriorityBadge(voucher.priority)}
          </div>

          <div className="flex items-center space-x-3">
            {canSubmit() && (
              <button
                onClick={handleSubmit}
                disabled={actionLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit for Approval
              </button>
            )}

            {canApprove() && (
              <>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </button>
                <button
                  onClick={() => setShowApprovalModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Payee Name
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {voucher.payee_name}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Total Amount
                </dt>
                <dd className="mt-1 text-sm font-gray-900 flex items-center">
                  <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="font-medium">
                    {formatCurrency(voucher.total_amount, voucher.currency)}
                  </span>
                </dd>
              </div>

              {voucher.payee_address && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">
                    Payee Address
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {voucher.payee_address}
                  </dd>
                </div>
              )}

              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Purpose</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {voucher.purpose}
                </dd>
              </div>

              {voucher.due_date && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Due Date
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                    {new Date(voucher.due_date).toLocaleDateString()}
                  </dd>
                </div>
              )}

              {voucher.invoice_number && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Invoice Number
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {voucher.invoice_number}
                  </dd>
                </div>
              )}

              {voucher.po_number && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    PO Number
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {voucher.po_number}
                  </dd>
                </div>
              )}

              {voucher.notes && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Notes</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {voucher.notes}
                  </dd>
                </div>
              )}
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Line Items
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Cost
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {voucher?.VoucherLines?.map((line, _index) => (
                    <tr key={line.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {line.VoteBookAccount.code}
                        </div>
                        <div className="text-sm text-gray-500">
                          {line.VoteBookAccount.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {line.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {line.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {formatCurrency(line.unit_cost, voucher.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-medium">
                        {formatCurrency(line.total_amount, voucher.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-6 border-t border-gray-200 pt-4">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal:</span>
                    <span>
                      {formatCurrency(voucher.total_amount, voucher.currency)}
                    </span>
                  </div>
                  {voucher.tax_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tax:</span>
                      <span>
                        {formatCurrency(voucher.tax_amount, voucher.currency)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-medium border-t border-gray-200 pt-2">
                    <span>Total:</span>
                    <span>
                      {formatCurrency(voucher.net_amount, voucher.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Requester Information */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Requester
            </h2>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">
                  {voucher.requester.first_name} {voucher.requester.last_name}
                </div>
                <div className="text-sm text-gray-500">
                  {voucher.requester.email}
                </div>
              </div>
            </div>
          </div>

          {/* Approval History */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Approval History
            </h2>

            {voucher.ApprovalActions.length > 0 ? (
              <div className="flow-root">
                <ul className="-mb-8">
                  {voucher.ApprovalActions.map((action, idx) => (
                    <li key={action.id}>
                      <div className="relative pb-8">
                        {idx !== voucher.ApprovalActions.length - 1 && (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span
                              className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                action.action === "approve"
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                            >
                              {action.action === "approve" ? (
                                <CheckCircle className="h-5 w-5 text-white" />
                              ) : (
                                <XCircle className="h-5 w-5 text-white" />
                              )}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5">
                            <div>
                              <p className="text-sm text-gray-500">
                                <span className="font-medium text-gray-900">
                                  {action.actor.first_name}{" "}
                                  {action.actor.last_name}
                                </span>{" "}
                                {action.action === "approve"
                                  ? "approved"
                                  : "rejected"}{" "}
                                at Level {action.level}
                              </p>
                              <p className="mt-0.5 text-sm text-gray-500">
                                {formatDate(action.decision_date)}
                              </p>
                            </div>
                            {action.comment && (
                              <div className="mt-2 text-sm text-gray-700">
                                <p>{action.comment}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No approval actions yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-center mx-auto w-12 h-12 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="mt-5 text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Approve Voucher
                </h3>
                <div className="mt-4">
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={3}
                    placeholder="Add approval comment (optional)"
                    value={actionComment}
                    onChange={(e) => setActionComment(e.target.value)}
                  />
                </div>
                <div className="mt-6 flex justify-center space-x-3">
                  <button
                    onClick={() => setShowApprovalModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {actionLoading ? "Approving..." : "Approve"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-center mx-auto w-12 h-12 rounded-full bg-red-100">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-5 text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Reject Voucher
                </h3>
                <div className="mt-4 space-y-3">
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={2}
                    placeholder="Rejection reason *"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={3}
                    placeholder="Additional comments (optional)"
                    value={actionComment}
                    onChange={(e) => setActionComment(e.target.value)}
                  />
                </div>
                <div className="mt-6 flex justify-center space-x-3">
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={actionLoading || !rejectReason.trim()}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {actionLoading ? "Rejecting..." : "Reject"}
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

export default VoucherDetail;
