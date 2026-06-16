import { Link } from "react-router-dom";
import { useOrganization } from "../GlobalContexts/Organization-Context";
import { useMemo, useState } from "react";

function StatusPill({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1",
        isActive
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
          : "bg-slate-50 text-slate-700 ring-slate-200",
      ].join(" ")}
    >
      <span
        className={[
          "h-1.5 w-1.5 rounded-full",
          isActive ? "bg-emerald-500" : "bg-slate-400",
        ].join(" ")}
      />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function StageChips({
  stages,
  expanded,
  max = 4,
}: {
  stages: { name: string }[];
  expanded: boolean;
  max?: number;
}) {
  const shown = expanded ? stages : stages.slice(0, max);
  const remaining = Math.max(0, stages.length - max);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {shown.map((s, idx) => (
        <span
          key={`${s.name}-${idx}`}
          className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
          title={s.name}
        >
          {s.name}
        </span>
      ))}

      {!expanded && remaining > 0 && (
        <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
          +{remaining} more
        </span>
      )}
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-slate-900 transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export default function WorkflowListing() {
  const { workflows } = useOrganization();

  const rows = useMemo(() => workflows?.rows ?? [], [workflows]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"All" | "Active" | "Inactive">("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = [...rows];

    if (status !== "All") {
      const isActive = status === "Active";
      list = list.filter((w: any) => Boolean(w.isActive) === isActive);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((w: any) => {
        const name = (w?.name ?? "").toLowerCase();
        const desc = (w?.description ?? "").toLowerCase();
        const stages = (w?.stages ?? []).some((s: any) =>
          (s?.name ?? "").toLowerCase().includes(q)
        );
        return name.includes(q) || desc.includes(q) || stages;
      });
    }

    return list;
  }, [rows, query, status]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">

        {/* Controls */}
        <div className="mt-6 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-center">
            <div className="sm:col-span-8">
              <label className="text-xs font-medium text-slate-600">
                Search
              </label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search workflows, stages, descriptions…"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="text-xs font-medium text-slate-600">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                <option>All</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="mt-6 grid gap-4">
          {filtered.map((workflow: any) => {
            const stages = workflow?.stages ?? [];
            const stageCount = stages.length;

            // "Progress" placeholder: just reflects stage count visually
            const progress = stageCount
              ? Math.min(100, Math.round((1 / stageCount) * 100))
              : 0;

            const isExpanded = expandedId === workflow.id;

            return (
              <div
                key={workflow.id}
                className="group rounded-2xl bg-white p-5 ring-1 ring-slate-200 transition hover:-translate-y-[1px] hover:shadow-md"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
                        {workflow?.name}
                      </h3>

                      <StatusPill isActive={!!workflow?.isActive} />

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId((prev) =>
                            prev === workflow.id ? null : workflow.id
                          )
                        }
                        className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
                        title={isExpanded ? "Hide stages" : "Show stages"}
                      >
                        {stageCount} stages
                      </button>
                    </div>

                    {workflow?.description ? (
                      <p className="mt-2 text-sm text-slate-600">
                        {workflow.description}
                      </p>
                    ) : (
                      <p className="mt-2 text-sm text-slate-500">
                        No description provided.
                      </p>
                    )}

                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
                        <span>Stage flow</span>
                        <span className="text-slate-500">
                          {isExpanded ? "Showing all stages" : "Showing preview"}
                        </span>
                      </div>

                      <StageChips
                        stages={stages}
                        expanded={isExpanded}
                        max={4}
                      />

                      {/* <div className="mt-3">
                        <ProgressBar value={progress} />
                        <p className="mt-2 text-xs text-slate-500">
                          Tip: Add routing rules and conditions to automate who
                          approves what.
                        </p>
                      </div> */}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
                    <Link
                      to={`/workflows/${workflow.id}`}
                      className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 sm:w-auto"
                    >
                      View details
                    </Link>

                    {/* Uncomment when ready */}
                    <Link
                      to={`/workflows/add-edit/${workflow.id}`}
                      className="w-full rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 sm:w-auto"
                    >
                      Edit
                    </Link>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  {/* <div className="text-xs text-slate-500">
                    Workflow settings can manage permissions, ownership, and
                    audit-friendly history.
                  </div> */}
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                      Audit-ready
                    </span>
                    <span className="rounded-lg bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                      Versioning
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-slate-200">
              <p className="text-sm font-semibold text-slate-900">
                No workflows found
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Try adjusting your search or filters.
              </p>
              <Link
                to="/workflows/create"
                className="mt-5 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                + Create Workflow
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}