import React, { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { getMutationMethod } from "../common/api-methods";

export type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

type EmployeeTypeaheadProps = {
  label?: string;
  value: Employee | null;
  onChange: (employee: Employee | null) => void;
  placeholder?: string;
  autoFocus?: boolean;
  disabled?: boolean;
};

export default function EmployeeTypeahead({
  label = "Employee",
  value,
  onChange,
  placeholder = "Search employees...",
  autoFocus = false,
  disabled = false,
}: EmployeeTypeaheadProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutateAsync: fetchEmployees } = useMutation({
    mutationFn: (body: any) =>
      getMutationMethod("POST", `api/employees/lookup`, body, true),
    onSuccess: (data) => {
      setEmployees(data.rows || []);
      setActiveIndex(-1);
    },
    onError: (error) => console.error("Lookup failed:", error),
  });

  // Fetch when typing
  useEffect(() => {
    const t = setTimeout(() => {
      if (query.trim().length > 0) {
        fetchEmployees({ search: query, limit: 10 });
        setOpen(true);
      } else {
        setOpen(false);
      }
    }, 200);

    return () => clearTimeout(t);
  }, [query]);

  console.log("=======employees====employees", employees);

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
    if (!employees.length) return;
    setActiveIndex((prev) => {
      const next = (prev + dir + employees.length) % employees.length;
      const container = listRef.current;
      const item = container?.querySelector(
        `[data-index="${next}"]`
      ) as HTMLElement;

      if (container && item) {
        const cTop = container.scrollTop;
        const cBottom = cTop + container.clientHeight;
        if (item.offsetTop < cTop) container.scrollTop = item.offsetTop;
        else if (item.offsetTop + item.offsetHeight > cBottom)
          container.scrollTop =
            item.offsetTop + item.offsetHeight - container.clientHeight;
      }

      return next;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || !employees.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveActive(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveActive(-1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) {
        onChange(employees[activeIndex]);
        setOpen(false);
        setQuery("");
      }
    }
  };

  // CLEAR input + selected value
  const handleClear = () => {
    setQuery("");
    onChange(null);
    setOpen(false);
    setActiveIndex(-1);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className="mb-1 block text-xs font-medium text-slate-600">
        {label}
      </label>

      <div className="relative justify-center items-center w-full sm:max-w-md">
        {/* <i className="fas fa-search pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" /> */}
        <input
          ref={inputRef}
          type="text"
          className="w-full border text-sm border-gray-300 rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-indigo-500"
          placeholder={query ?? placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            query && setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          disabled={disabled}
        />

        {/* Selected value displayed when query is empty */}
        {value && !query && (
          <div className="absolute inset-y-0 left-3 flex items-center text-gray-700 pointer-events-none text-sm">
            <span className="font-medium text-xs">
              {value.firstName} {value.lastName}
            </span>
          </div>
        )}

        {/* Clear Button (x) */}
        {(query || value) && !disabled && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-600"
            aria-label="Clear selection"
          >
            x
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          ref={listRef}
          className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto z-50"
        >
          {employees.length > 0 ? (
            employees.map((employee, idx) => (
              <button
                key={employee.id}
                data-index={idx}
                onClick={() => {
                  onChange(employee);
                  setOpen(false);
                  setQuery("");
                }}
                className={`w-full px-4 py-2 text-left flex items-center gap-3 border-b last:border-b-0
                  ${
                    idx === activeIndex
                      ? "bg-indigo-50 text-indigo-700"
                      : "hover:bg-gray-50"
                  }`}
              >
                <span className="font-medium text-xs">
                  {employee.firstName} {employee.lastName}
                </span>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500 text-xs">
              No results
            </div>
          )}
        </div>
      )}
    </div>
  );
}
