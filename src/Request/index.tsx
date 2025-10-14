// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.

import React, { useEffect, useMemo, useState } from "react";
import type { ApiFilter, WorkflowRequestData } from "../common/types";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../GlobalContexts/AuthContext";
import { getMutationMethod } from "../common/api-methods";
import { useMutation } from "@tanstack/react-query";

const departments = [
  "Engineering",
  "Marketing",
  "Sales",
  "Human Resources",
  "Finance",
  "Research & Development",
];
const requestTypes = [
  "Position Transfer",
  "Salary Adjustment",
  "Promotion",
  "New Position Requisition",
];
const statuses = ["Pending", "Approved", "Rejected", "Under Review"];

const statusTone: Record<string, string> = {
  Approved: "bg-green-50 text-green-700 ring-green-200",
  Rejected: "bg-red-50 text-red-700 ring-red-200",
  "Under Review": "bg-blue-50 text-blue-700 ring-blue-200",
  Pending: "bg-yellow-50 text-yellow-800 ring-yellow-200",
  default: "bg-gray-50 text-gray-700 ring-gray-200",
};

function StatusBadge({ status }: { status?: string }) {
  const tone = statusTone[status || ""] || statusTone.default;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tone}`}
    >
      {status || "Unknown"}
    </span>
  );
}

function ProgressBar({
  current = 0,
  total = 0,
}: {
  current?: number;
  total?: number;
}) {
  const pct =
    total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-indigo-600 transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 w-12 text-right">{pct}%</span>
    </div>
  );
}

const RequestList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [workflowRequests, setWorkflowRequests] = useState<WorkflowRequestData>(
    {
      rows: [],
      count: 0,
      hasMore: false,
    }
  );

  const [filter, setFilter] = useState<ApiFilter>({
    filters: [
      {
        key: "organizationId",
        value: user?.organizationId || "",
        condition: "equal",
      },
      { key: "stages.assignedToId", value: user?.id, condition: "equal" },
    ],
    limit: 10,
    offset: 0,
  });

  const page = useMemo(
    () => Math.floor((filter.offset || 0) / (filter.limit || 1)) + 1,
    [filter]
  );
  const totalPages = useMemo(
    () =>
      Math.max(
        1,
        Math.ceil((workflowRequests.count || 0) / (filter.limit || 1))
      ),
    [workflowRequests.count, filter.limit]
  );

  const {
    mutateAsync: fetchWorkflowRequest,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (body: ApiFilter) =>
      getMutationMethod(
        "POST",
        `api/workflowrequest/get-request-history`,
        body,
        true
      ),
    onSuccess: (data) => setWorkflowRequests(data),
    onError: (err) => console.error("Failed to fetch workflow requests:", err),
  });

  useEffect(() => {
    fetchWorkflowRequest(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.offset, filter.limit]); // keep server fetch tied to pagination/limit

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return (workflowRequests.rows || []).filter((r: any) => {
      const matchesTerm =
        !term ||
        String(r.id).toLowerCase().includes(term) ||
        `${r?.requestor?.firstName || ""} ${r?.requestor?.lastName || ""}`
          .toLowerCase()
          .includes(term) ||
        (r?.workflow?.name || "").toLowerCase().includes(term);

      const matchesType = !selectedType || r?.workflow?.name === selectedType;
      const matchesStatus = !selectedStatus || r?.status === selectedStatus;
      const matchesDept =
        !selectedDepartment ||
        (r?.requestor?.department?.name || "") === selectedDepartment;

      return matchesTerm && matchesType && matchesStatus && matchesDept;
    });
  }, [
    workflowRequests.rows,
    searchTerm,
    selectedType,
    selectedStatus,
    selectedDepartment,
  ]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("");
    setSelectedStatus("");
    setSelectedDepartment("");
  };

  const goToPage = (p: number) => {
    const clamped = Math.max(1, Math.min(totalPages, p));
    setFilter((prev) => ({
      ...prev,
      offset: (clamped - 1) * (prev.limit || 10),
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:mb-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
              My Assigned Requests
            </h1>
            <p className="text-sm text-slate-600">
              Track progress and review details for each workflow request.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFiltersOpen((v) => !v)}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 md:hidden"
            >
              <i className="fas fa-sliders-h mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:block">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-1 flex-col gap-4 sm:flex-row">
              <div className="relative mt-4 justify-center items-center w-full sm:max-w-md">
                <i className="fas fa-search pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by ID, employee, or type…"
                  className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 py-2 text-sm text-slate-700 outline-none ring-blue-500 focus:border-blue-500 focus:ring-2"
                />
              </div>
              <Select
                label="Type"
                value={selectedType}
                onChange={setSelectedType}
                options={requestTypes}
              />
              <Select
                label="Status"
                value={selectedStatus}
                onChange={setSelectedStatus}
                options={statuses}
              />
              <Select
                label="Department"
                value={selectedDepartment}
                onChange={setSelectedDepartment}
                options={departments}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearFilters}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Filters Panel */}
        {mobileFiltersOpen && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:hidden">
            <div className="mb-3">
              <div className="relative">
                <i className="fas fa-search pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search requests…"
                  className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 py-2 text-sm text-slate-700 outline-none ring-blue-500 focus:border-blue-500 focus:ring-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Select
                label="Type"
                value={selectedType}
                onChange={setSelectedType}
                options={requestTypes}
              />
              <Select
                label="Status"
                value={selectedStatus}
                onChange={setSelectedStatus}
                options={statuses}
              />
              <Select
                label="Department"
                value={selectedDepartment}
                onChange={setSelectedDepartment}
                options={departments}
              />
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={clearFilters}
                className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Clear
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
              >
                Apply
              </button>
            </div>
          </div>
        )}

        {/* Content States */}
        {isPending && (
          <div className="mt-6 grid gap-3 md:gap-4">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        )}
        {isError && !isPending && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load requests. Please try again.
          </div>
        )}
        {!isPending && filteredRows.length === 0 && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <i className="fas fa-inbox text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-900">No results</p>
            <p className="mt-1 text-sm text-slate-600">
              Try adjusting filters or search terms.
            </p>
          </div>
        )}

        {/* Mobile Cards */}
        <div className="mt-4 space-y-4 md:hidden">
          {filteredRows.map((r: any) => {
            const total = r?.workflow?.stages?.length ?? 0;
            const current = r?.stages?.length ?? 0;
            return (
              <div
                key={r.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {r?.workflow?.name}
                  </h3>
                  <StatusBadge status={r?.status} />
                </div>
                <div className="space-y-1 text-sm">
                  <div className="text-slate-700">
                    <i className="fas fa-user mr-2 text-slate-400" />
                    {r?.requestor?.firstName} {r?.requestor?.lastName}
                  </div>
                  <div className="text-slate-700">
                    <i className="fas fa-building mr-2 text-slate-400" />
                    {r?.requestor?.department?.name || "—"}
                  </div>
                  <div className="text-slate-700">
                    <i className="fas fa-calendar mr-2 text-slate-400" />
                    {moment(r?.createdAt).format("YYYY/MM/DD")}
                  </div>
                </div>
                {total > 0 && (
                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Workflow Progress
                      </span>
                      <span className="text-xs text-slate-500">
                        {current}/{total}
                      </span>
                    </div>
                    <ProgressBar current={current} total={total} />
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => navigate(`request-response/${r.id}/view`)}
                    className="flex-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                  >
                    <i className="fas fa-eye mr-2" />
                    View
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table */}
        {filteredRows.length > 0 && (
          <div className="mt-6 hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
            <div className="max-h-[70vh] overflow-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase text-slate-600 ring-1 ring-slate-200">
                  <tr>
                    <Th>Request</Th>
                    <Th>Employee</Th>
                    <Th>Status</Th>
                    <Th>Progress</Th>
                    <Th className="text-right">Actions</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredRows.map((r: any) => {
                    const total = r?.workflow?.stages?.length ?? 0;
                    const current = r?.stages?.length ?? 0;
                    return (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <Td>
                          <div className="font-medium text-slate-900">
                            {r?.workflow?.name}
                          </div>
                          <div className="text-xs text-slate-500">#{r.id}</div>
                        </Td>
                        <Td className="whitespace-nowrap">
                          <div className="font-medium text-slate-900">
                            {r?.requestor?.firstName} {r?.requestor?.lastName}
                          </div>
                          <div className="text-xs text-slate-500">
                            {r?.requestor?.department?.name || "—"}
                          </div>
                        </Td>
                        <Td className="whitespace-nowrap">
                          <StatusBadge status={r?.status} />
                        </Td>
                        <Td className="w-64">
                          <ProgressBar current={current} total={total} />
                        </Td>
                        <Td className="whitespace-nowrap text-right">
                          <button
                            onClick={() =>
                              navigate(`request-response/${r.id}/view`)
                            }
                            className="inline-flex items-center rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                          >
                            <i className="fas fa-eye mr-2" />
                            View
                          </button>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer / Pagination */}
        <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-slate-600">
            Showing <span className="font-medium">{filteredRows.length}</span>{" "}
            of <span className="font-medium">{workflowRequests.count}</span>{" "}
            requests
          </p>
          <div className="inline-flex items-center gap-1">
            <PageBtn
              onClick={() => goToPage(1)}
              disabled={page === 1}
              icon="fa-angles-left"
            />
            <PageBtn
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              icon="fa-chevron-left"
            />
            <span className="mx-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700">
              Page {page} of {totalPages}
            </span>
            <PageBtn
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              icon="fa-chevron-right"
            />
            <PageBtn
              onClick={() => goToPage(totalPages)}
              disabled={page === totalPages}
              icon="fa-angles-right"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

function Th({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <th
      className={`px-6 py-3 text-xs font-semibold tracking-wide ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) {
  return <td className={`px-6 py-4 align-middle ${className}`}>{children}</td>;
}

function SkeletonRow() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 h-4 w-1/3 rounded bg-slate-200" />
      <div className="flex gap-2">
        <div className="h-2 w-full rounded bg-slate-200" />
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <label className="mb-1 block text-xs font-medium text-slate-600">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-blue-500 focus:border-blue-500 focus:ring-2"
        >
          <option value="">All {label}</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <i className="fas fa-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
      </div>
    </div>
  );
}

function PageBtn({
  onClick,
  disabled,
  icon,
}: {
  onClick: () => void;
  disabled?: boolean;
  icon: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!!disabled}
      className={`inline-flex items-center rounded-md border px-2.5 py-1.5 text-sm shadow-sm ${
        disabled
          ? "cursor-not-allowed border-slate-200 bg-white text-slate-300"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
      aria-disabled={disabled}
    >
      <i className={`fa ${icon}`} />
    </button>
  );
}

export default RequestList;
