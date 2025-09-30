import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { voteBookAPI } from "../services/api";
import {
  ArrowLeft,
  BookOpen,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  FileText,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Plus,
  Minus,
} from "lucide-react";

interface VoteBookAccountDetail {
  id: number;
  code: string;
  name: string;
  description?: string;
  account_type: string;
  account_class: string;
  is_frozen: boolean;
  is_active: boolean;
  balances: {
    allocation_base: number;
    sum_adjust_in: number;
    sum_adjust_out: number;
    sum_transfer_in: number;
    sum_transfer_out: number;
    carryover: number;
    committed: number;
    spent: number;
    available: number;
  };
  FiscalYear: {
    year: number;
    is_current: boolean;
  };
  Department?: {
    name: string;
    code: string;
  };
  NcoaCode?: {
    id: number;
    code: string;
    economic_type: string;
    fg_title: string;
    state_title: string;
    lg_title: string;
    account_type: string;
    level: number;
    type: string;
  };
  budgetAdjustments: Array<{
    id: number;
    reference_number: string;
    adjustment_type: string;
    amount: number;
    status: string;
    justification: string;
    effective_date: string;
    created_at: string;
    approval_date?: string;
    posted_date?: string;
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
    };
    approver?: {
      first_name: string;
      last_name: string;
    };
  }>;
  allocations: Array<{
    id: number;
    date: string;
    source: string;
    amount: number;
    notes?: string;
    created_by: {
      first_name: string;
      last_name: string;
    };
  }>;
  commitments: Array<{
    id: number;
    voucher_id: number;
    amount: number;
    status: string;
    created_at: string;
    voucher: {
      voucher_number: string;
      purpose: string;
      payee_name: string;
    };
    remaining_amount: number;
    expenditures: Array<{
      id: number;
      amount: number;
      date: string;
    }>;
  }>;
  expenditures: Array<{
    id: number;
    voucher_id: number;
    amount: number;
    payment_date: string;
    voucher: {
      voucher_number: string;
      payee_name: string;
      purpose: string;
    };
    approved_by: {
      first_name: string;
      last_name: string;
    };
    cost_object?: string;
    notes?: string;
  }>;
}

const VoteBookAccountDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [account, setAccount] = useState<VoteBookAccountDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [_error, setError] = useState("");

  useEffect(() => {
    if (id) {
      loadAccountDetail();
    }
  }, [id]);

  const loadAccountDetail = async () => {
    try {
      setLoading(true);
      const response = await voteBookAPI.getAccountDetail(Number(id));
      setAccount(response);
    } catch (error: any) {
      setError(error.message || "Failed to load account details");
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getAdjustmentTypeIcon = (type: string) => {
    const icons = {
      SUPPLEMENT: TrendingUp,
      REDUCTION: TrendingDown,
      TRANSFER: ArrowRightLeft,
      CARRYFORWARD: Plus,
      REVERSAL: Minus,
    };
    return icons[type as keyof typeof icons] || TrendingUp;
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
      DRAFT: { bg: "bg-gray-100", text: "text-gray-800", icon: FileText },
      PENDING: { bg: "bg-yellow-100", text: "text-yellow-800", icon: Clock },
      APPROVED: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: CheckCircle,
      },
      REJECTED: { bg: "bg-red-100", text: "text-red-800", icon: XCircle },
      POSTED: { bg: "bg-blue-100", text: "text-blue-800", icon: CheckCircle },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </span>
    );
  };

  const getCommitmentStatusBadge = (status: string) => {
    const statusConfig = {
      active: { bg: "bg-blue-100", text: "text-blue-800", label: "Open" },
      partial: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Partially Liquidated",
      },
      closed: { bg: "bg-green-100", text: "text-green-800", label: "Closed" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.active;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const calculateRunningBalance = (
    adjustments: any[],
    currentIndex: number
  ) => {
    let balance = account?.balances.allocation_base || 0;

    for (let i = 0; i <= currentIndex; i++) {
      const adj = adjustments[i];
      switch (adj.adjustment_type) {
        case "SUPPLEMENT":
        case "TRANSFER_IN":
          balance += adj.amount;
          break;
        case "REDUCTION":
        case "TRANSFER_OUT":
          balance -= adj.amount;
          break;
      }
    }

    return balance;
  };

  const tabs = [
    { id: "overview", name: "Overview", icon: Eye },
    { id: "adjustments", name: "Budget Adjustments", icon: TrendingUp },
    { id: "allocations", name: "Allocations", icon: Plus },
    { id: "commitments", name: "Commitments", icon: Clock },
    { id: "expenditures", name: "Expenditures", icon: DollarSign },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Account not found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          The vote book account you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate("/votebook")}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {account.NcoaCode?.code || account.code} - {account.name}
                </h1>
                <p className="text-sm text-gray-600">
                  {account.Department?.name} • FY {account?.FiscalYear?.year}
                  {account.FiscalYear?.is_current && (
                    <span className="ml-2 text-green-600">(Current)</span>
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {account.is_frozen ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                Frozen
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Active
              </span>
            )}
          </div>
        </div>

        {/* NCOA Information */}
        {account.NcoaCode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              NCOA Classification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Code:</span>
                <span className="ml-2 text-blue-900">
                  {account.NcoaCode.code}
                </span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">
                  Economic Type:
                </span>
                <span className="ml-2 text-blue-900">
                  {account.NcoaCode.economic_type}
                </span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Level:</span>
                <span className="ml-2 text-blue-900">
                  {account.NcoaCode.level}
                </span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Type:</span>
                <span className="ml-2 text-blue-900">
                  {account.NcoaCode.type}
                </span>
              </div>
              <div className="md:col-span-2 lg:col-span-4">
                <span className="text-blue-700 font-medium">Title:</span>
                <span className="ml-2 text-blue-900">
                  {account.NcoaCode.fg_title ||
                    account.NcoaCode.state_title ||
                    account.NcoaCode.lg_title}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Balance Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-sm font-medium text-gray-500">Allocation</div>
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(account.balances.allocation_base)}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-sm font-medium text-gray-500">Adjustments</div>
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(
                account.balances.sum_adjust_in - account.balances.sum_adjust_out
              )}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-sm font-medium text-gray-500">Transfers</div>
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(
                account.balances.sum_transfer_in -
                  account.balances.sum_transfer_out
              )}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-sm font-medium text-gray-500">Carryover</div>
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(account.balances.carryover)}
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow-sm border border-yellow-200">
            <div className="text-sm font-medium text-yellow-700">Committed</div>
            <div className="text-lg font-semibold text-yellow-800">
              {formatCurrency(account.balances.committed)}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-200">
            <div className="text-sm font-medium text-green-700">Available</div>
            <div className="text-xl font-bold text-green-800">
              {formatCurrency(account.balances.available)}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    isActive
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow-sm rounded-lg">
        {activeTab === "overview" && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Account Overview
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  Account Information
                </h4>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Account Code
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {account.NcoaCode?.code || account.code}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Account Name
                    </dt>
                    <dd className="text-sm text-gray-900">{account.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Account Type
                    </dt>
                    <dd className="text-sm text-gray-900 capitalize">
                      {account.account_type}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Account Class
                    </dt>
                    <dd className="text-sm text-gray-900 capitalize">
                      {account.account_class}
                    </dd>
                  </div>
                  {account.description && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Description
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {account.description}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  Balance Breakdown
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">
                      Base Allocation
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(account.balances.allocation_base)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-green-700">
                      + Adjustments In
                    </span>
                    <span className="text-sm font-semibold text-green-800">
                      {formatCurrency(account.balances.sum_adjust_in)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-sm font-medium text-red-700">
                      - Adjustments Out
                    </span>
                    <span className="text-sm font-semibold text-red-800">
                      {formatCurrency(account.balances.sum_adjust_out)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-blue-700">
                      + Transfers In
                    </span>
                    <span className="text-sm font-semibold text-blue-800">
                      {formatCurrency(account.balances.sum_transfer_in)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium text-purple-700">
                      - Transfers Out
                    </span>
                    <span className="text-sm font-semibold text-purple-800">
                      {formatCurrency(account.balances.sum_transfer_out)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                    <span className="text-sm font-medium text-indigo-700">
                      + Carryover
                    </span>
                    <span className="text-sm font-semibold text-indigo-800">
                      {formatCurrency(account.balances.carryover)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span className="text-sm font-medium text-yellow-700">
                        - Committed
                      </span>
                      <span className="text-sm font-semibold text-yellow-800">
                        {formatCurrency(account.balances.committed)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg mt-2">
                      <span className="text-sm font-medium text-red-700">
                        - Spent
                      </span>
                      <span className="text-sm font-semibold text-red-800">
                        {formatCurrency(account.balances.spent)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg mt-2 border-2 border-green-300">
                      <span className="text-base font-semibold text-green-700">
                        Available Balance
                      </span>
                      <span className="text-lg font-bold text-green-800">
                        {formatCurrency(account.balances.available)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "adjustments" && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Budget Adjustment Ledger
            </h3>

            {account.budgetAdjustments &&
            account.budgetAdjustments.length > 0 ? (
              <div className="space-y-4">
                {account.budgetAdjustments.map((adjustment, index) => {
                  const Icon = getAdjustmentTypeIcon(
                    adjustment.adjustment_type
                  );
                  const typeColor = getAdjustmentTypeColor(
                    adjustment.adjustment_type
                  );
                  const runningBalance = calculateRunningBalance(
                    account.budgetAdjustments,
                    index
                  );
                  const isIncrease = ["SUPPLEMENT", "TRANSFER_IN"].includes(
                    adjustment.adjustment_type
                  );

                  return (
                    <div
                      key={adjustment.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">
                              {formatDate(adjustment.effective_date)}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">
                              {adjustment.reference_number}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColor}`}
                          >
                            <Icon className="h-3 w-3 mr-1" />
                            {adjustment.adjustment_type.replace("_", " ")}
                          </span>
                          {getStatusBadge(adjustment.status)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
                        <div>
                          <span className="text-sm font-medium text-gray-500">
                            Amount:
                          </span>
                          <div
                            className={`text-lg font-semibold ${
                              isIncrease ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {isIncrease ? "+" : "-"}
                            {formatCurrency(adjustment.amount)}
                          </div>
                        </div>

                        {adjustment.fromAccount && (
                          <div>
                            <span className="text-sm font-medium text-gray-500">
                              From Account:
                            </span>
                            <div className="text-sm text-gray-900">
                              {adjustment.fromAccount.code} -{" "}
                              {adjustment.fromAccount.name}
                            </div>
                          </div>
                        )}

                        <div>
                          <span className="text-sm font-medium text-gray-500">
                            Running Balance:
                          </span>
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(runningBalance)}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <span className="text-sm font-medium text-gray-500">
                            Entered by:
                          </span>
                          <div className="text-sm text-gray-900">
                            {adjustment.requestor.first_name}{" "}
                            {adjustment.requestor.last_name}
                          </div>
                        </div>

                        {adjustment.approver && (
                          <div>
                            <span className="text-sm font-medium text-gray-500">
                              Approved by:
                            </span>
                            <div className="text-sm text-gray-900">
                              {adjustment.approver.first_name}{" "}
                              {adjustment.approver.last_name}
                              {adjustment.approval_date && (
                                <span className="text-gray-500 ml-2">
                                  on {formatDate(adjustment.approval_date)}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Justification:
                        </span>
                        <p className="text-sm text-gray-900 mt-1">
                          {adjustment.justification}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No budget adjustments
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  No budget adjustments have been made to this account.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "allocations" && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Allocation History
            </h3>

            {account.allocations && account.allocations.length > 0 ? (
              <div className="space-y-4">
                {account.allocations.map((allocation) => (
                  <div
                    key={allocation.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {formatDate(allocation.date)}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            allocation.source === "Original"
                              ? "bg-blue-100 text-blue-800"
                              : allocation.source === "Supplementary"
                              ? "bg-green-100 text-green-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {allocation.source}
                        </span>
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(allocation.amount)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Created by:
                        </span>
                        <div className="text-sm text-gray-900">
                          {allocation.created_by.first_name}{" "}
                          {allocation.created_by.last_name}
                        </div>
                      </div>

                      {allocation.notes && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">
                            Notes:
                          </span>
                          <p className="text-sm text-gray-900">
                            {allocation.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Plus className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No allocations
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  No allocation history available for this account.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "commitments" && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Commitments
            </h3>

            {account.commitments && account.commitments.length > 0 ? (
              <div className="space-y-4">
                {account.commitments.map((commitment) => (
                  <div
                    key={commitment.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {formatDate(commitment.created_at)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                            {commitment.voucher.voucher_number}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold text-gray-900">
                          {formatCurrency(commitment.amount)}
                        </span>
                        {getCommitmentStatusBadge(commitment.status)}
                      </div>
                    </div>

                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-500">
                        Description:
                      </span>
                      <p className="text-sm text-gray-900 mt-1">
                        {commitment.voucher.purpose}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Vendor/Payee:
                        </span>
                        <div className="text-sm text-gray-900">
                          {commitment.voucher.payee_name}
                        </div>
                      </div>

                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Remaining Amount:
                        </span>
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(commitment.remaining_amount)}
                        </div>
                      </div>
                    </div>

                    {commitment.expenditures &&
                      commitment.expenditures.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">
                            Linked Expenditures:
                          </span>
                          <div className="mt-2 space-y-1">
                            {commitment.expenditures.map((exp) => (
                              <div
                                key={exp.id}
                                className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded"
                              >
                                <span className="text-gray-700">
                                  {formatDate(exp.date)}
                                </span>
                                <span className="font-medium text-gray-900">
                                  {formatCurrency(exp.amount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No commitments
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  No fund commitments have been made against this account.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "expenditures" && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Expenditures
            </h3>

            {account.expenditures && account.expenditures.length > 0 ? (
              <div className="space-y-4">
                {account.expenditures.map((expenditure) => (
                  <div
                    key={expenditure.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {formatDate(expenditure.payment_date)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                            {expenditure.voucher.voucher_number}
                          </span>
                        </div>
                      </div>
                      <div className="text-lg font-semibold text-red-600">
                        -{formatCurrency(expenditure.amount)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Vendor/Payee:
                        </span>
                        <div className="text-sm text-gray-900">
                          {expenditure.voucher.payee_name}
                        </div>
                      </div>

                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Approved by:
                        </span>
                        <div className="text-sm text-gray-900">
                          {expenditure.approved_by.first_name}{" "}
                          {expenditure.approved_by.last_name}
                        </div>
                      </div>

                      {expenditure.cost_object && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">
                            Cost Object:
                          </span>
                          <div className="text-sm text-gray-900">
                            {expenditure.cost_object}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-500">
                        Description:
                      </span>
                      <p className="text-sm text-gray-900 mt-1">
                        {expenditure.voucher.purpose}
                      </p>
                    </div>

                    {expenditure.notes && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Notes:
                        </span>
                        <p className="text-sm text-gray-900 mt-1">
                          {expenditure.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No expenditures
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  No expenditures have been recorded against this account.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoteBookAccountDetail;
