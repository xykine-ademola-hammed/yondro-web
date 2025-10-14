import React, { useState, useEffect } from "react";
import { useAuth } from "../GlobalContexts/AuthContext";
import { voteBookAPI } from "../services/api";
import {
  Plus,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Lock,
  Unlock,
  Search,
  Filter,
  DollarSign,
} from "lucide-react";
import BudgetAdjustmentModal from "./BudgetAdjustmentModal";
import VoteBookAccountForm from "./VoteBookAccountForm";
import { useNavigate } from "react-router-dom";
import MoneyDisplay from "../components/ui/MoneyDisplay";

export interface VoteBookAccount {
  id: number;
  code: string;
  name: string;
  description?: string;
  account_type: string;
  account_class: string;
  is_frozen: boolean;
  is_active: boolean;
  balances: {
    allocation: number;
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
}

const VoteBookManagement: React.FC = () => {
  const { hasPermission } = useAuth();
  const [accounts, setAccounts] = useState<VoteBookAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    account_type: "",
    account_class: "",
    department_id: "",
  });

  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjustmentAccount, setAdjustmentAccount] = useState<
    VoteBookAccount | null | undefined
  >(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadAccounts();
  }, [filters]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await voteBookAPI.getAccounts(filters);
      setAccounts(response || []);
    } catch (error) {
      console.error("Failed to load accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getAccountTypeIcon = (type: string) => {
    const icons = {
      asset: TrendingUp,
      liability: TrendingDown,
      equity: BookOpen,
      revenue: TrendingUp,
      expense: TrendingDown,
    };
    return icons[type as keyof typeof icons] || BookOpen;
  };

  const getAccountTypeBadge = (type: string) => {
    const colors = {
      asset: "bg-green-100 text-green-800",
      liability: "bg-red-100 text-red-800",
      equity: "bg-blue-100 text-blue-800",
      revenue: "bg-purple-100 text-purple-800",
      expense: "bg-orange-100 text-orange-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getAccountClassBadge = (accountClass: string) => {
    const colors = {
      operational: "bg-blue-100 text-blue-800",
      capital: "bg-green-100 text-green-800",
      personnel: "bg-purple-100 text-purple-800",
      maintenance: "bg-yellow-100 text-yellow-800",
      emergency: "bg-red-100 text-red-800",
    };
    return (
      colors[accountClass as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  const getAvailableBalanceColor = (available: number) => {
    if (available < 0) return "text-red-600";
    if (available < 1000) return "text-yellow-600";
    return "text-green-600";
  };

  const toggleAccountFreeze = async (
    accountId: number,
    currentlyFrozen: boolean
  ) => {
    try {
      await voteBookAPI.freezeAccount(accountId, !currentlyFrozen);
      await loadAccounts();
    } catch (error) {
      console.error("Failed to toggle account freeze:", error);
    }
  };

  if (!hasPermission("manage_votebook")) {
    return (
      <div className="text-center py-12">
        <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Access Denied
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          You don't have permission to manage vote book accounts.
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
            Vote Book Management
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage budget accounts, allocations, and spending limits
          </p>
        </div>
        {hasPermission("create_votebook_account") && (
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Account
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
                <BookOpen className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Accounts
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {accounts.length}
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
                    Total Allocation
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    <MoneyDisplay
                      value={accounts.reduce(
                        (sum, acc) => sum + acc.balances.allocation,
                        0
                      )}
                    />
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
                <TrendingDown className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Committed
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    <MoneyDisplay
                      value={accounts.reduce(
                        (sum, acc) => sum + acc.balances.committed,
                        0
                      )}
                    />
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
                <BookOpen className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Available
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    <MoneyDisplay
                      value={accounts.reduce(
                        (sum, acc) => sum + acc.balances.available,
                        0
                      )}
                    />
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
                placeholder="Search accounts..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
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
              <option value="">All Types</option>
              <option value="asset">Asset</option>
              <option value="liability">Liability</option>
              <option value="equity">Equity</option>
              <option value="revenue">Revenue</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Class
            </label>
            <select
              value={filters.account_class}
              onChange={(e) =>
                handleFilterChange("account_class", e.target.value)
              }
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Classes</option>
              <option value="operational">Operational</option>
              <option value="capital">Capital</option>
              <option value="personnel">Personnel</option>
              <option value="maintenance">Maintenance</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={loadAccounts}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Accounts List */}
      <div className="bg-white shadow-sm rounded-lg">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading accounts...</p>
          </div>
        ) : accounts.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type & Class
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Allocation
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Committed
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Spent
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Available
                    </th>

                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {accounts.map((account) => {
                    const Icon = getAccountTypeIcon(account.account_type);

                    return (
                      <tr key={account.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Icon className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {account.code}
                              </div>
                              <div className="text-sm text-gray-500">
                                {account.name}
                              </div>
                              {account.Department && (
                                <div className="text-xs text-gray-400">
                                  {account.Department.code}
                                </div>
                              )}
                              {account.NcoaCode && (
                                <div className="text-xs text-blue-600">
                                  NCOA: {account.NcoaCode.code}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAccountTypeBadge(
                                account.account_type
                              )} capitalize`}
                            >
                              {account.account_type}
                            </span>
                            <div>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAccountClassBadge(
                                  account.account_class
                                )} capitalize`}
                              >
                                {account.account_class}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                          <MoneyDisplay value={account.balances.allocation} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                          <MoneyDisplay value={account.balances.committed} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                          <MoneyDisplay value={account.balances.spent} />
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${getAvailableBalanceColor(
                            account.balances.available
                          )}`}
                        >
                          <MoneyDisplay value={account.balances.available} />
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center space-x-2">
                            {account.is_frozen ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <Lock className="h-3 w-3 mr-1" />
                                Frozen
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <Unlock className="h-3 w-3 mr-1" />
                                Active
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => {
                                setAdjustmentAccount(account);
                                setShowAdjustmentModal(true);
                              }}
                              className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full"
                              title="Add Funds"
                            >
                              <DollarSign className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                toggleAccountFreeze(
                                  account.id,
                                  account.is_frozen
                                )
                              }
                              className={`p-1 rounded-full hover:bg-gray-100 ${
                                account.is_frozen
                                  ? "text-green-600 hover:text-green-700"
                                  : "text-red-600 hover:text-red-700"
                              }`}
                              title={
                                account.is_frozen
                                  ? "Unfreeze Account"
                                  : "Freeze Account"
                              }
                            >
                              {account.is_frozen ? (
                                <Unlock className="h-4 w-4" />
                              ) : (
                                <Lock className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() =>
                                navigate(`/votebook/${account.id}`)
                              }
                              className="text-blue-600 hover:text-blue-700 text-sm"
                              title="View Details"
                            >
                              Details
                            </button>
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
                {accounts.map((account) => {
                  const Icon = getAccountTypeIcon(account.account_type);

                  return (
                    <div
                      key={account.id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <Icon className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {account.code}
                            </div>
                            <div className="text-sm text-gray-500">
                              {account.name}
                            </div>
                            {account.NcoaCode && (
                              <div className="text-xs text-blue-600">
                                NCOA: {account.NcoaCode.code}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAccountTypeBadge(
                              account.account_type
                            )} capitalize`}
                          >
                            {account.account_type}
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAccountClassBadge(
                              account.account_class
                            )} capitalize`}
                          >
                            {account.account_class}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <span className="text-xs font-medium text-gray-500">
                            Allocationing:
                          </span>
                          <p className="text-sm font-medium text-gray-900">
                            <MoneyDisplay value={account.balances.allocation} />
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-500">
                            Available:
                          </span>
                          <p
                            className={`text-sm font-medium ${getAvailableBalanceColor(
                              account.balances.available
                            )}`}
                          >
                            {formatCurrency(account.balances.available)}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-500">
                            Committed:
                          </span>
                          <p className="text-sm text-gray-900">
                            <MoneyDisplay value={account.balances.committed} />
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-500">
                            Spent:
                          </span>
                          <p className="text-sm text-gray-900">
                            <MoneyDisplay value={account.balances.spent} />
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {account.is_frozen ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <Lock className="h-3 w-3 mr-1" />
                              Frozen
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Unlock className="h-3 w-3 mr-1" />
                              Active
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setAdjustmentAccount(account);
                              setShowAdjustmentModal(true);
                            }}
                            className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full"
                            title="Add Funds"
                          >
                            <DollarSign className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              toggleAccountFreeze(account.id, account.is_frozen)
                            }
                            className={`p-1 rounded-full hover:bg-gray-100 ${
                              account.is_frozen
                                ? "text-green-600 hover:text-green-700"
                                : "text-red-600 hover:text-red-700"
                            }`}
                            title={
                              account.is_frozen
                                ? "Unfreeze Account"
                                : "Freeze Account"
                            }
                          >
                            {account.is_frozen ? (
                              <Unlock className="h-4 w-4" />
                            ) : (
                              <Lock className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => navigate(`/votebook/${account.id}`)}
                            className="text-blue-600 hover:text-blue-700 text-xs"
                            title="View Details"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="p-6 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No accounts found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.search || filters.account_type || filters.account_class
                ? "Try adjusting your filters"
                : "Get started by creating your first vote book account."}
            </p>
            {hasPermission("create_votebook_account") &&
              !filters.search &&
              !filters.account_type &&
              !filters.account_class && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Account
                  </button>
                </div>
              )}
          </div>
        )}
      </div>

      {/* Create Account Form */}
      <VoteBookAccountForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSuccess={() => {
          loadAccounts();
          setShowCreateForm(false);
        }}
      />

      {/* Budget Adjustment Modal */}
      <BudgetAdjustmentModal
        isOpen={showAdjustmentModal}
        onClose={() => {
          setShowAdjustmentModal(false);
          setAdjustmentAccount(null);
        }}
        onSuccess={() => {
          loadAccounts();
        }}
        selectedAccount={adjustmentAccount}
      />
    </div>
  );
};

export default VoteBookManagement;
