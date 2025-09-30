import React, { useState, useEffect } from "react";
import { voucherAPI, voteBookAPI, pdfAPI } from "../services/api";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  FileText,
  Download,
  Calendar,
  DollarSign,
  PieChart,
  Activity,
} from "lucide-react";
import { useAuth } from "../GlobalContexts/AuthContext";

interface ReportData {
  vouchersByStatus: { [key: string]: number };
  vouchersByPriority: { [key: string]: number };
  totalAmount: number;
  monthlyTrend: Array<{ month: string; amount: number; count: number }>;
  topAccounts: Array<{
    code: string;
    name: string;
    spent: number;
    committed: number;
  }>;
}

const Reports: React.FC = () => {
  const { hasPermission } = useAuth();
  const [reportData, setReportData] = useState<ReportData>({
    vouchersByStatus: {},
    vouchersByPriority: {},
    totalAmount: 0,
    monthlyTrend: [],
    topAccounts: [],
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    try {
      setLoading(true);

      // Load vouchers data
      const vouchersResponse = await voucherAPI.getVouchers({ limit: 1000 });
      const vouchers = vouchersResponse.vouchers || [];

      // Load accounts data
      const accountsResponse = await voteBookAPI.getAccounts();
      const accounts = accountsResponse || [];

      // Process vouchers by status
      const vouchersByStatus = vouchers.reduce((acc: any, voucher: any) => {
        acc[voucher.status] = (acc[voucher.status] || 0) + 1;
        return acc;
      }, {});

      // Process vouchers by priority
      const vouchersByPriority = vouchers.reduce((acc: any, voucher: any) => {
        acc[voucher.priority] = (acc[voucher.priority] || 0) + 1;
        return acc;
      }, {});

      // Calculate total amount
      const totalAmount = vouchers.reduce(
        (sum: number, voucher: any) =>
          sum + parseFloat(voucher.total_amount || 0),
        0
      );

      // Generate monthly trend (mock data for demo)
      const monthlyTrend = [
        { month: "Jan", amount: 125000, count: 45 },
        { month: "Feb", amount: 98000, count: 38 },
        { month: "Mar", amount: 156000, count: 52 },
        { month: "Apr", amount: 134000, count: 47 },
        { month: "May", amount: 178000, count: 61 },
        { month: "Jun", amount: 145000, count: 49 },
      ];

      // Top accounts by spending
      const topAccounts = accounts
        .sort(
          (a: any, b: any) =>
            (b.balances?.spent || 0) - (a.balances?.spent || 0)
        )
        .slice(0, 10)
        .map((account: any) => ({
          code: account.code,
          name: account.name,
          spent: account.balances?.spent || 0,
          committed: account.balances?.committed || 0,
        }));

      setReportData({
        vouchersByStatus,
        vouchersByPriority,
        totalAmount,
        monthlyTrend,
        topAccounts,
      });
    } catch (error) {
      console.error("Failed to load report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: "bg-gray-500",
      submitted: "bg-blue-500",
      approved_l1: "bg-yellow-500",
      approved_l2: "bg-yellow-600",
      approved_l3: "bg-orange-500",
      finance_approved: "bg-green-500",
      posted: "bg-green-600",
      paid: "bg-green-700",
      rejected: "bg-red-500",
      cancelled: "bg-gray-600",
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-gray-500",
      medium: "bg-blue-500",
      high: "bg-orange-500",
      urgent: "bg-red-500",
    };
    return colors[priority as keyof typeof colors] || "bg-gray-500";
  };

  const exportReport = (format: "csv" | "pdf") => {
    if (format === "pdf") {
      generatePdfReport();
    } else {
      // CSV export would be implemented here
      console.log(`Exporting report as ${format}`);
      alert(`CSV export would be implemented here`);
    }
  };

  const generatePdfReport = async () => {
    try {
      const filterStructure = {
        date_from: dateRange.startDate,
        date_to: dateRange.endDate,
        limit: 1000, // Get all records for report
      };

      const blob = await pdfAPI.generatePdf("vouchers", filterStructure);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `vouchers_report_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF report");
    }
  };

  if (!hasPermission("view_reports")) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Access Denied
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          You don't have permission to view reports.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Financial insights and performance metrics
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => exportReport("csv")}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
          <button
            onClick={() => exportReport("pdf")}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={loadReportData}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Update Report
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                        {formatCurrency(reportData.totalAmount)}
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
                        Total Vouchers
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {Object.values(reportData.vouchersByStatus).reduce(
                          (sum, count) => sum + count,
                          0
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
                    <TrendingUp className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Avg. Amount
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {formatCurrency(
                          reportData.totalAmount /
                            Math.max(
                              Object.values(reportData.vouchersByStatus).reduce(
                                (sum, count) => sum + count,
                                0
                              ),
                              1
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
                    <Activity className="h-6 w-6 text-orange-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Approval Rate
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {(() => {
                          const total = Object.values(
                            reportData.vouchersByStatus
                          ).reduce((sum, count) => sum + count, 0);
                          const approved =
                            (reportData.vouchersByStatus.finance_approved ||
                              0) +
                            (reportData.vouchersByStatus.posted || 0) +
                            (reportData.vouchersByStatus.paid || 0);
                          return total > 0
                            ? `${Math.round((approved / total) * 100)}%`
                            : "0%";
                        })()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vouchers by Status */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Vouchers by Status
                </h3>
                <PieChart className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {Object.entries(reportData.vouchersByStatus).map(
                  ([status, count]) => (
                    <div
                      key={status}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-3 h-3 rounded-full ${getStatusColor(
                            status
                          )} mr-3`}
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {status.replace("_", " ")}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {count}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Vouchers by Priority */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Vouchers by Priority
                </h3>
                <BarChart3 className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {Object.entries(reportData.vouchersByPriority).map(
                  ([priority, count]) => (
                    <div
                      key={priority}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-3 h-3 rounded-full ${getPriorityColor(
                            priority
                          )} mr-3`}
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {priority}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {count}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Monthly Trend
              </h3>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
            <div className="mt-6">
              <div className="flex items-end space-x-2 h-64">
                {reportData.monthlyTrend.map((data, _index) => {
                  const maxAmount = Math.max(
                    ...reportData.monthlyTrend.map((d) => d.amount)
                  );
                  const height = (data.amount / maxAmount) * 200;

                  return (
                    <div
                      key={data.month}
                      className="flex-1 flex flex-col items-center"
                    >
                      <div className="w-full flex flex-col items-center">
                        <div
                          className="w-full bg-blue-500 rounded-t-sm transition-all duration-300 hover:bg-blue-600"
                          style={{ height: `${height}px` }}
                          title={`${data.month}: ${formatCurrency(
                            data.amount
                          )} (${data.count} vouchers)`}
                        />
                        <div className="mt-2 text-xs text-gray-500">
                          {data.month}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatCurrency(data.amount)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top Spending Accounts */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Top Spending Accounts
              </h3>
              <TrendingDown className="h-5 w-5 text-gray-400" />
            </div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Spent
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Committed
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.topAccounts.map((account, _index) => (
                    <tr key={account.code}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {account.code}
                          </div>
                          <div className="text-sm text-gray-500">
                            {account.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {formatCurrency(account.spent)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        {formatCurrency(account.committed)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                        {formatCurrency(account.spent + account.committed)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden">
              <div className="space-y-3">
                {reportData.topAccounts.map((account, _index) => (
                  <div
                    key={account.code}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {account.code}
                        </div>
                        <div className="text-sm text-gray-500">
                          {account.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(account.spent + account.committed)}
                        </div>
                        <div className="text-xs text-gray-500">Total</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-xs font-medium text-gray-500">
                          Spent:
                        </span>
                        <p className="text-sm text-gray-900">
                          {formatCurrency(account.spent)}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">
                          Committed:
                        </span>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(account.committed)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
