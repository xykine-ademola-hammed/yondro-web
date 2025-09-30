import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { voucherAPI } from "../services/api";
import {
  FileText,
  Clock,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Plus,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { useAuth } from "../GlobalContexts/AuthContext";

interface DashboardStats {
  totalVouchers: number;
  pendingApprovals: number;
  approvedVouchers: number;
  totalAmount: number;
  recentVouchers: any[];
}

const Dashboard: React.FC = () => {
  const { user, hasRole, hasPermission } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalVouchers: 0,
    pendingApprovals: 0,
    approvedVouchers: 0,
    totalAmount: 0,
    recentVouchers: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Fetch recent vouchers
      const vouchersResponse = await voucherAPI.getVouchers({ limit: 10 });
      const vouchers = vouchersResponse.vouchers || [];

      // Calculate stats
      const totalVouchers = vouchers.length;
      const pendingApprovals = vouchers.filter((v: any) =>
        ["submitted", "approved_l1", "approved_l2", "approved_l3"].includes(
          v.status
        )
      ).length;
      const approvedVouchers = vouchers.filter((v: any) =>
        ["finance_approved", "posted", "paid"].includes(v.status)
      ).length;
      const totalAmount = vouchers.reduce(
        (sum: number, v: any) => sum + parseFloat(v.total_amount || 0),
        0
      );

      setStats({
        totalVouchers,
        pendingApprovals,
        approvedVouchers,
        totalAmount,
        recentVouchers: vouchers.slice(0, 5),
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { bg: "bg-gray-100", text: "text-gray-800", label: "Draft" },
      submitted: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Submitted",
      },
      approved_l1: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "L1 Approved",
      },
      approved_l2: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "L2 Approved",
      },
      approved_l3: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "L3 Approved",
      },
      finance_approved: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Approved",
      },
      posted: { bg: "bg-green-100", text: "text-green-800", label: "Posted" },
      paid: { bg: "bg-green-100", text: "text-green-800", label: "Paid" },
      rejected: { bg: "bg-red-100", text: "text-red-800", label: "Rejected" },
      cancelled: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        label: "Cancelled",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-sm">
        <div className="px-6 py-8 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="mt-2 text-blue-100">
                Here's what's happening with your financial workflows today.
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-blue-200">Today</div>
                  <div className="text-lg font-semibold text-white">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
                <Calendar className="h-8 w-8 text-blue-200" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Vouchers
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalVouchers}
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
                    Pending Approvals
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.pendingApprovals}
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
                    {stats.approvedVouchers}
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
                <DollarSign className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Value
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(stats.totalAmount)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Quick Actions
            </h3>
          </div>
          <div className="px-6 py-5 space-y-3">
            {hasPermission("create_voucher") && (
              <Link
                to="/vouchers/new"
                className="flex items-center p-3 -m-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Create New Voucher
                  </p>
                  <p className="text-sm text-gray-500">
                    Start a new payment request
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </Link>
            )}

            {hasRole([
              "approver_l1",
              "approver_l2",
              "approver_l3",
              "finance_officer",
            ]) && (
              <Link
                to="/approvals"
                className="flex items-center p-3 -m-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 h-10 w-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Review Approvals
                  </p>
                  <p className="text-sm text-gray-500">
                    Process pending vouchers
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </Link>
            )}

            {hasPermission("manage_votebook") && (
              <Link
                to="/votebook"
                className="flex items-center p-3 -m-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 h-10 w-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Manage Vote Book
                  </p>
                  <p className="text-sm text-gray-500">
                    View and manage budget accounts
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </Link>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Vouchers
              </h3>
              <Link
                to="/vouchers"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="px-6 py-5">
            {stats.recentVouchers.length > 0 ? (
              <div className="flow-root">
                <ul className="-mb-8">
                  {stats.recentVouchers.map((voucher, idx) => (
                    <li key={voucher.id}>
                      <div className="relative pb-8">
                        {idx !== stats.recentVouchers.length - 1 && (
                          <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" />
                        )}
                        <div className="relative flex items-start space-x-3">
                          <div className="relative">
                            <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center ring-8 ring-white">
                              <FileText className="h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div>
                              <div className="text-sm">
                                <Link
                                  to={`/vouchers/${voucher.id}`}
                                  className="font-medium text-gray-900 hover:text-blue-600"
                                >
                                  {voucher.voucher_number}
                                </Link>
                              </div>
                              <p className="mt-0.5 text-sm text-gray-500">
                                {voucher.payee_name} •{" "}
                                {formatCurrency(voucher.total_amount)}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center space-x-2">
                              {getStatusBadge(voucher.status)}
                              <span className="text-sm text-gray-500">
                                {new Date(
                                  voucher.created_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-6">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No vouchers yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new voucher.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
