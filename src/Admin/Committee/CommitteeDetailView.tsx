import React, { useMemo } from "react";
import {
  type Committee,
  type CommitteeMember,
  CommitteeTypeOptions,
  CommitteeRoleOptions,
} from "../../common/types";
import ModalWrapper from "../../components/modal-wrapper";

type Props = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  modalMode: "add" | "edit" | "view";
  selectedCommittee: Committee;
  className?: string;
};

const typeLabel = (type: any) =>
  CommitteeTypeOptions.find((t) => t.value === type)?.label ?? String(type);

const roleLabel = (role: any) =>
  CommitteeRoleOptions.find((r) => r.value === role)?.label ?? String(role);

const fmtDate = (d?: string | null) => {
  if (!d) return "-";
  // Handles "2026-01-04" and ISO strings
  const date = new Date(d.length === 10 ? `${d}T00:00:00Z` : d);
  // If invalid, fallback
  if (Number.isNaN(date.getTime())) return String(d);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const initials = (name?: string) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "?";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (a + b).toUpperCase();
};

const Pill = ({
  children,
  tone = "gray",
}: {
  children: React.ReactNode;
  tone?: "gray" | "indigo" | "emerald" | "amber" | "sky";
}) => {
  const tones: Record<string, string> = {
    gray: "bg-gray-50 text-gray-700 border-gray-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    sky: "bg-sky-50 text-sky-700 border-sky-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
};

const StatusPill = ({ active }: { active: boolean }) => (
  <span
    className={[
      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border",
      active
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-gray-50 text-gray-700 border-gray-200",
    ].join(" ")}
  >
    <span
      className={[
        "h-1.5 w-1.5 rounded-full",
        active ? "bg-emerald-500" : "bg-gray-400",
      ].join(" ")}
    />
    {active ? "Active" : "Inactive"}
  </span>
);

const roleTone = (role: any): "indigo" | "amber" | "sky" => {
  if (String(role) === "CHAIR") return "indigo";
  if (String(role) === "SECRETARY") return "amber";
  return "sky";
};

const getEmpName = (m: CommitteeMember) =>
  (m.employee as any)?.fullName ??
  (m.employee as any)?.name ??
  `${(m.employee as any)?.firstName ?? ""} ${
    (m.employee as any)?.lastName ?? ""
  }`.trim() ??
  (m.employee as any)?.email ??
  String(m.employeeId ?? "");

const getEmpEmail = (m: CommitteeMember) => (m.employee as any)?.email ?? "";

const getEmpPhone = (m: CommitteeMember) => (m.employee as any)?.phone ?? "";

const memberSortRank = (role: any) => {
  const r = String(role);
  if (r === "CHAIR") return 1;
  if (r === "SECRETARY") return 2;
  return 3;
};

export const CommitteeDetailView: React.FC<Props> = ({
  isModalOpen,
  setIsModalOpen,
  modalMode,
  selectedCommittee,
  className = "",
}) => {
  const members = useMemo(() => {
    const ms = selectedCommittee?.members ?? [];
    return [...ms].sort(
      (a, b) => memberSortRank(a.role) - memberSortRank(b.role),
    );
  }, [selectedCommittee]);

  // const stats = useMemo(() => {
  //   const total = members.length;
  //   const active = members.filter(
  //     (m: any) => !!(m.isActive ?? m.isActived),
  //   ).length;
  //   const chair = members.filter((m) => String(m.role) === "CHAIR").length;
  //   const secretary = members.filter(
  //     (m) => String(m.role) === "SECRETARY",
  //   ).length;
  //   return { total, active, chair, secretary };
  // }, [members]);

  const orgName =
    (selectedCommittee as any)?.organization?.name ??
    (selectedCommittee as any)?.organizationName ??
    "";

  return (
    <ModalWrapper
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title={modalMode === "add" ? "Add New Committee" : "Edit Committee"}
    >
      <div className={`w-full ${className}`}>
        {/* Top header */}

        {/* Body */}
        <div className="mt-4">
          {/* Left: committee summary */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-gray-300 bg-white shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-900">Summary</h3>

              <div className="mt-3 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-xs text-gray-500">Committee</div>
                  <div className="text-sm font-medium text-gray-900 text-right">
                    {selectedCommittee?.name}
                  </div>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div className="text-xs text-gray-500">Type</div>
                  <div className="text-sm font-medium text-gray-900 text-right">
                    {typeLabel(selectedCommittee?.type)}
                  </div>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div className="text-xs text-gray-500">Organization ID</div>
                  <div className="text-sm font-medium text-gray-900">
                    {String((selectedCommittee as any)?.organizationId ?? "-")}
                  </div>
                </div>

                {orgName ? (
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-xs text-gray-500">Organization</div>
                    <div className="text-sm font-medium text-gray-900 text-right">
                      {orgName}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Right: members */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-300 bg-white shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Members
                  </h3>
                  <p className="text-xs text-gray-500">
                    {members.length === 0
                      ? "No members assigned."
                      : "Showing members (Chair/Secretary first)."}
                  </p>
                </div>
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-white">
                    <tr className="text-left text-xs font-semibold text-gray-600">
                      <th className="px-4 py-3">Employee</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Dates</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {members.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-6 text-sm text-gray-500"
                        >
                          No members yet.
                        </td>
                      </tr>
                    ) : (
                      members.map((m) => {
                        const empName = getEmpName(m);
                        const email = getEmpEmail(m);
                        const phone = getEmpPhone(m);
                        const active = !!(
                          (m as any).isActive ?? (m as any).isActived
                        );

                        return (
                          <tr key={String(m.id ?? `${m.employeeId}-${m.role}`)}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-gray-100 border flex items-center justify-center text-xs font-semibold text-gray-700">
                                  {initials(empName)}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-sm font-medium text-gray-900 truncate">
                                    {empName}
                                  </div>
                                  <div className="text-xs text-gray-500 truncate">
                                    {email
                                      ? email
                                      : phone
                                        ? phone
                                        : `Employee ID: ${m.employeeId}`}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Pill tone={roleTone(m.role)}>
                                {roleLabel(m.role)}
                              </Pill>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              <div className="text-xs text-gray-500">Start</div>
                              <div className="text-sm">
                                {fmtDate((m as any).startDate)}
                              </div>
                              <div className="mt-1 text-xs text-gray-500">
                                End
                              </div>
                              <div className="text-sm">
                                {fmtDate((m as any).endDate)}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <StatusPill active={active} />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden divide-y">
                {members.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500">
                    No members yet.
                  </div>
                ) : (
                  members.map((m) => {
                    const empName = getEmpName(m);
                    const email = getEmpEmail(m);
                    const phone = getEmpPhone(m);
                    const active = !!(
                      (m as any).isActive ?? (m as any).isActived
                    );

                    return (
                      <div
                        key={String(m.id ?? `${m.employeeId}-${m.role}`)}
                        className="p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-10 w-10 rounded-full bg-gray-100 border flex items-center justify-center text-xs font-semibold text-gray-700">
                              {initials(empName)}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-gray-900 truncate">
                                {empName}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {email
                                  ? email
                                  : phone
                                    ? phone
                                    : `Employee ID: ${m.employeeId}`}
                              </div>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <Pill tone={roleTone(m.role)}>
                                  {roleLabel(m.role)}
                                </Pill>
                                <StatusPill active={active} />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <div className="rounded-lg border bg-gray-50 p-2">
                            <div className="text-[11px] text-gray-500">
                              Start
                            </div>
                            <div className="text-sm text-gray-800">
                              {fmtDate((m as any).startDate)}
                            </div>
                          </div>
                          <div className="rounded-lg border bg-gray-50 p-2">
                            <div className="text-[11px] text-gray-500">End</div>
                            <div className="text-sm text-gray-800">
                              {fmtDate((m as any).endDate)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};
