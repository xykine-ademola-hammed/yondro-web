import React, { useEffect, useRef, useState, useMemo } from "react";
import { useAllAccounts } from "../api/financeHooks";
import { X } from "lucide-react";

export type Account = {
    id: string;
    accountCode: string;
    accountName: string;
};

type AccountTypeaheadProps = {
    label?: string;
    value?: string | null;
    onChange: (accountId: string | null) => void;
    accountType: string;
    placeholder?: string;
    autoFocus?: boolean;
    disabled?: boolean;
    required?: boolean;
};

export default function AccountTypeahead({
    label = "Account",
    value,
    onChange,
    accountType,
    placeholder = "Type to search accounts...",
    autoFocus = false,
    disabled = false,
    required = false,
}: AccountTypeaheadProps) {
    const [query, setQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(-1);
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { data: accountsResponse } = useAllAccounts(accountType);
    const allAccounts = accountsResponse?.data || [];

    // Filter accounts based on query
    const filteredAccounts = useMemo(() => {
        if (!query.trim()) return [];
        const lowerQuery = query.toLowerCase();
        return allAccounts.filter(
            (acc: Account) =>
                acc.accountCode.toLowerCase().includes(lowerQuery) ||
                acc.accountName.toLowerCase().includes(lowerQuery)
        ).slice(0, 10);
    }, [allAccounts, query]);

    // Find the selected account for display
    const selectedAccount = useMemo(() => {
        return allAccounts.find((acc: Account) => acc.id === value);
    }, [allAccounts, value]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        window.addEventListener("mousedown", handler);
        return () => window.removeEventListener("mousedown", handler);
    }, []);

    const moveActive = (dir: 1 | -1) => {
        if (!filteredAccounts.length) return;
        setActiveIndex((prev) => {
            const next = (prev + dir + filteredAccounts.length) % filteredAccounts.length;
            return next;
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!open || !filteredAccounts.length) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            moveActive(1);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            moveActive(-1);
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeIndex >= 0) {
                onChange(filteredAccounts[activeIndex].id);
                setOpen(false);
                setQuery("");
            }
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    };

    const handleClear = () => {
        setQuery("");
        onChange(null);
        setOpen(false);
        setActiveIndex(-1);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                {label}
            </label>

            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    required={required && !value}
                    className="w-full border text-sm border-slate-200 rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white disabled:bg-slate-50 disabled:text-slate-500"
                    placeholder={selectedAccount ? "" : placeholder}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => {
                        if (query) setOpen(true);
                    }}
                    onKeyDown={handleKeyDown}
                    autoFocus={autoFocus}
                    disabled={disabled}
                />

                {selectedAccount && !query && (
                    <div className="absolute inset-y-0 left-3 flex items-center text-slate-700 pointer-events-none text-sm overflow-hidden pr-8">
                        <span className="font-medium truncate">
                            {selectedAccount.accountCode} - {selectedAccount.accountName}
                        </span>
                    </div>
                )}

                {(query || value) && !disabled && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute inset-y-0 right-2 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {open && query.trim() !== "" && (
                <div
                    ref={listRef}
                    className="absolute mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto z-[60] py-1 shadow-indigo-100/50"
                >
                    {filteredAccounts.length > 0 ? (
                        filteredAccounts.map((acc: Account, idx: number) => (
                            <button
                                key={acc.id}
                                type="button"
                                data-index={idx}
                                onMouseEnter={() => setActiveIndex(idx)}
                                onClick={() => {
                                    onChange(acc.id);
                                    setOpen(false);
                                    setQuery("");
                                }}
                                className={`w-full px-4 py-2 text-left flex flex-col border-b border-slate-50 last:border-b-0 transition-colors
                  ${idx === activeIndex
                                        ? "bg-indigo-50 text-indigo-700"
                                        : "hover:bg-slate-50 text-slate-700"
                                    }`}
                            >
                                <span className="font-bold text-xs">{acc.accountCode}</span>
                                <span className="text-[11px] opacity-70 truncate">{acc.accountName}</span>
                            </button>
                        ))
                    ) : (
                        <div className="p-4 text-center text-slate-500 text-xs">
                            No accounts found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
