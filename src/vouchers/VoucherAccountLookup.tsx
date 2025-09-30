import React, { useState, useEffect, useRef } from "react";
import { voteBookAPI } from "../services/api";
import { Search, Check, DollarSign } from "lucide-react";

export interface VoteBookAccountLookup {
  id: number;
  code: string;
  name: string;
  balances: {
    available: number;
  };
  NcoaCode?: {
    code: string;
    economic_type: string;
    fg_title: string;
    state_title: string;
    lg_title: string;
    level: number;
  };
}

export interface VoucherAccountLookupProps {
  onSelect: (account: VoteBookAccountLookup) => void;
  selectedAccount?: VoteBookAccountLookup | null;
  className?: string;
  error?: string;
  isEnabled?: boolean;
}

const VoucherAccountLookup: React.FC<VoucherAccountLookupProps> = ({
  onSelect,
  selectedAccount,
  isEnabled = false,
  className = "",
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [accounts, setAccounts] = useState<VoteBookAccountLookup[]>([]);
  const [loading, setLoading] = useState(false);
  const [filteredAccounts, setFilteredAccounts] = useState<
    VoteBookAccountLookup[]
  >([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadAccounts();
    }
  }, [isOpen]);

  useEffect(() => {
    filterAccounts();
  }, [accounts, searchTerm]);

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

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await voteBookAPI.getAccounts();
      setAccounts(response || []);
    } catch (error) {
      console.error("Failed to load accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAccounts = () => {
    if (!searchTerm.trim()) {
      setFilteredAccounts(accounts);
      return;
    }

    const filtered = accounts.filter((account) => {
      const ncoaCode = account.NcoaCode?.code || account.code;
      const searchLower = searchTerm.toLowerCase();

      return (
        ncoaCode.toLowerCase().includes(searchLower) ||
        account.name.toLowerCase().includes(searchLower) ||
        (account.NcoaCode?.fg_title || "")
          .toLowerCase()
          .includes(searchLower) ||
        (account.NcoaCode?.state_title || "")
          .toLowerCase()
          .includes(searchLower) ||
        (account.NcoaCode?.lg_title || "").toLowerCase().includes(searchLower)
      );
    });

    setFilteredAccounts(filtered);
  };

  const handleAccountSelect = (account: VoteBookAccountLookup) => {
    onSelect(account);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
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

  const getDisplayCode = (account: VoteBookAccountLookup) => {
    return account.NcoaCode?.code || account.code;
  };

  const getDisplayTitle = (account: VoteBookAccountLookup) => {
    if (!account.NcoaCode) return account.name;

    // Prefer fg_title, fallback to state_title, then lg_title
    const title =
      account.NcoaCode.fg_title ||
      account.NcoaCode.state_title ||
      account.NcoaCode.lg_title ||
      account.name;

    return title.length > 60 ? `${title.substring(0, 60)}...` : title;
  };

  return (
    <div className={`w-full relative ${className}`} ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Vote Book Account *
      </label>

      {/* Selected Account Display */}
      <div
        onClick={isEnabled ? handleOpen : () => {}}
        className={`flex gap-4 justify-between items-end w-full bg-white border rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
          error ? "border-red-300" : "border-gray-300"
        }`}
      >
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-600">
            Account Title
          </label>
          <div
            className={`mt-0 w-full p-1 border ${
              isEnabled ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            {selectedAccount?.name ?? "-"}
          </div>
        </div>
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-600">
            Account Code No.
          </label>
          <div
            className={`mt-0 w-full p-1 border ${
              isEnabled ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            {selectedAccount?.code ?? "-"}
          </div>
        </div>
        <button className="px-2 py-1 rounded bg-green-500 text-white cursor-pointer">
          Search
        </button>
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-96 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {/* Search */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-3">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by NCOA code, account name, or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="px-3 py-4 text-sm text-gray-500 flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Loading accounts...
              </div>
            ) : filteredAccounts.length > 0 ? (
              filteredAccounts.map((account) => (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => handleAccountSelect(account)}
                  className="w-full text-left px-3 py-3 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">
                          {getDisplayCode(account)}
                        </span>
                        <div className="flex items-center text-sm text-green-600 font-medium">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {formatCurrency(account.balances?.available || 0)}
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 mb-2">
                        {account.name}
                      </div>

                      {account.NcoaCode && (
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            {getDisplayTitle(account)}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getEconomicTypeBadge(
                                account.NcoaCode.economic_type
                              )}`}
                            >
                              {account.NcoaCode.economic_type}
                            </span>
                            <span className="text-xs text-gray-400">
                              Level {account.NcoaCode.level}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    {selectedAccount?.id === account.id && (
                      <Check className="h-4 w-4 text-blue-600 ml-2" />
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                {searchTerm
                  ? "No accounts found matching your search"
                  : "No accounts available"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherAccountLookup;
