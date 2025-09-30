import React, { useState, useEffect, useRef } from "react";
import { ncoaAPI } from "../services/api";
import { Search, ChevronDown, Check } from "lucide-react";

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
}

interface NcoaLookupProps {
  onSelect: (code: NcoaCode) => void;
  selectedCode?: NcoaCode | null;
  className?: string;
}

const NcoaLookup: React.FC<NcoaLookupProps> = ({
  onSelect,
  selectedCode,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [titleType, setTitleType] = useState<
    "fg_title" | "state_title" | "lg_title"
  >("fg_title");
  const [economicType, setEconomicType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [codes, setCodes] = useState<NcoaCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [filteredCodes, setFilteredCodes] = useState<NcoaCode[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const economicTypes = [
    { value: "", label: "All Economic Types" },
    { value: "Revenue", label: "Revenue" },
    { value: "Expenditures", label: "Expenditures" },
    { value: "Assets", label: "Assets" },
    { value: "Liabilities", label: "Liabilities" },
  ];

  const titleTypes = [
    { value: "fg_title", label: "Federal Government Title" },
    { value: "state_title", label: "State Government Title" },
    { value: "lg_title", label: "Local Government Title" },
  ];

  useEffect(() => {
    if (isOpen && economicType) {
      loadCodes();
    }
  }, [isOpen, economicType]);

  useEffect(() => {
    filterCodes();
  }, [codes, searchTerm, titleType]);

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

  const loadCodes = async () => {
    try {
      setLoading(true);
      const response = await ncoaAPI.getCodes({
        economic_type: economicType,
        limit: 1000,
      });
      setCodes(response.codes || []);
    } catch (error) {
      console.error("Failed to load NCOA codes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterCodes = () => {
    if (!searchTerm.trim()) {
      setFilteredCodes(codes);
      return;
    }

    const filtered = codes.filter((code) => {
      const titleToSearch = code[titleType] || "";
      return (
        code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        titleToSearch.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    setFilteredCodes(filtered);
  };

  const handleCodeSelect = (code: NcoaCode) => {
    onSelect(code);
    setIsOpen(false);
    setSearchTerm("");
  };

  const getDisplayTitle = (code: NcoaCode) => {
    const title = code[titleType] || "N/A";
    return title.length > 60 ? `${title.substring(0, 60)}...` : title;
  };

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        NCOA Code *
      </label>

      {/* Selected Code Display */}
      <button
        type="button"
        onClick={handleOpen}
        className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      >
        {selectedCode ? (
          <div>
            <span className="font-medium text-gray-900">
              {selectedCode.code}
            </span>
            <span className="ml-2 text-gray-500">
              {getDisplayTitle(selectedCode)}
            </span>
          </div>
        ) : (
          <span className="text-gray-500">Select NCOA code...</span>
        )}
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDown className="h-5 w-5 text-gray-400" />
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-96 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {/* Filters */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-3 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Title Type
              </label>
              <select
                value={titleType}
                onChange={(e) =>
                  setTitleType(
                    e.target.value as "fg_title" | "state_title" | "lg_title"
                  )
                }
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-xs"
              >
                {titleTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Economic Type
              </label>
              <select
                value={economicType}
                onChange={(e) => setEconomicType(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-xs"
              >
                {economicTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {economicType && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search by code or title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-7 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="max-h-64 overflow-y-auto">
            {!economicType ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                Please select an economic type to view codes
              </div>
            ) : loading ? (
              <div className="px-3 py-2 text-sm text-gray-500 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Loading codes...
              </div>
            ) : filteredCodes.length > 0 ? (
              filteredCodes.map((code) => (
                <button
                  key={code.id}
                  type="button"
                  onClick={() => handleCodeSelect(code)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {code.code}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            code.economic_type === "Revenue"
                              ? "bg-green-100 text-green-800"
                              : code.economic_type === "Expenditures"
                              ? "bg-red-100 text-red-800"
                              : code.economic_type === "Assets"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          Level {code.level}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 truncate">
                        {getDisplayTitle(code)}
                      </div>
                    </div>
                    {selectedCode?.id === code.id && (
                      <Check className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                {searchTerm
                  ? "No codes found matching your search"
                  : "No codes available for this economic type"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NcoaLookup;
