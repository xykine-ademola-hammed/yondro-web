import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  useJournals,
  useUnits,
  useApproveJournal,
  usePostJournal,
  useSubmitJournal,
} from "../../api/financeHooks";
import { downloadBlob } from "../../utils/download";
import { financeApi } from "../../../services/api";

function money(n: any) {
  const v = Number(n || 0);
  return v.toFixed(2);
}

function statusClass(status: string) {
  switch (status) {
    case "DRAFT":
      return "border-slate-200 bg-slate-50 text-slate-700";
    case "SUBMITTED":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "APPROVED":
      return "border-blue-200 bg-blue-50 text-blue-800";
    case "POSTED":
      return "border-green-200 bg-green-50 text-green-800";
    case "REVERSED":
      return "border-rose-200 bg-rose-50 text-rose-800";
    default:
      return "border-slate-200 bg-white text-slate-700";
  }
}

export default function JournalsPage() {
  const { data: units } = useUnits();

  const [unitId, setUnitId] = useState("");
  const [period, setPeriod] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");

  const { data: journals, isLoading } = useJournals({
    unitId: unitId || "",
    period: period || "",
    status: status || "",
    type: type || "",
  });

  const submitMut = useSubmitJournal(unitId as any, period, status, type);
  const approveMut = useApproveJournal(unitId as any, period, status, type);
  const postMut = usePostJournal(unitId as any, period, status, type);

  const rows = useMemo(() => journals ?? [], [journals]);

  async function downloadVoucher(id: string, journalNo: string) {
    const blob = await financeApi.downloadVoucherPdf(id);
    downloadBlob(blob, `voucher-${journalNo}.pdf`);
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 px-3 pb-24 pt-4 sm:px-6 sm:pb-8">
      {/* Header + Filters */}
      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
              Journals
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Journal stages: Draft → Submit → Approve → Post
            </p>
          </div>

          {/* Desktop primary action */}
          <div className="hidden sm:block">
            <Link
              to="/finance-report/new-journal"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
            >
              New Journal
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 p-4 sm:p-6 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-slate-700">Unit</label>
            <select
              className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
            >
              <option value="">Select unit</option>
              {(units?.data ?? []).map((u: any) => (
                <option key={u.id} value={u.id}>
                  {u.code} - {u.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">Period</label>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="YYYY-MM"
              inputMode="numeric"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">Status</label>
            <select
              className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All</option>
              <option value="DRAFT">DRAFT</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="APPROVED">APPROVED</option>
              <option value="POSTED">POSTED</option>
              <option value="REVERSED">REVERSED</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-medium text-slate-700">Type</label>
            <select
              className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">All</option>
              <option value="REVENUE">REVENUE</option>
              <option value="EXPENDITURE">EXPENDITURE</option>
              <option value="SALARY">SALARY</option>
              <option value="STORE">STORE</option>
              <option value="LOAN_ADVANCE">LOAN_ADVANCE</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <div className="mt-5 text-xs text-slate-500 md:mt-6">
              Showing{" "}
              <span className="font-semibold text-slate-900">
                {rows.length}
              </span>{" "}
              journal{rows.length === 1 ? "" : "s"}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700" />
              <span className="text-sm font-medium text-slate-600">
                Loading journals...
              </span>
            </div>
          </div>
        )}

        {/* Mobile cards */}
        <div className="md:hidden">
          {!isLoading && rows.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-3xl">📭</div>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                No journals
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Create a new journal or adjust your filters.
              </p>
            </div>
          ) : (
            <div className="space-y-3 p-3">
              {rows.map((j: any) => (
                <div
                  key={j.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="truncate text-sm font-semibold text-slate-900">
                          {j.journalNo}
                        </div>
                        <span className="text-slate-300">•</span>
                        <div className="truncate text-sm text-slate-700">
                          {j.journalType}
                        </div>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
                          {j.period}
                        </span>
                        <span>{j.transactionDate}</span>
                      </div>
                    </div>

                    <span
                      className={[
                        "shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold",
                        statusClass(j.status),
                      ].join(" ")}
                    >
                      {j.status}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Debit
                      </div>
                      <div className="mt-1 text-sm font-semibold tabular-nums text-slate-900">
                        {money(j.totalDebit)}
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Credit
                      </div>
                      <div className="mt-1 text-sm font-semibold tabular-nums text-slate-900">
                        {money(j.totalCredit)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3">
                    <button
                      className="rounded-xl border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      onClick={() => downloadVoucher(j.id, j.journalNo)}
                    >
                      Voucher
                    </button>

                    {j.status === "DRAFT" && (
                      <>
                        <Link
                          to={`/journals/${j.id}/edit`}
                          className="rounded-xl border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Edit
                        </Link>
                        <button
                          className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-50"
                          onClick={() => submitMut.mutate(j.id)}
                          disabled={submitMut.isPending}
                        >
                          {submitMut.isPending ? "Submitting..." : "Submit"}
                        </button>
                      </>
                    )}

                    {j.status === "SUBMITTED" && (
                      <button
                        className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-50"
                        onClick={() => approveMut.mutate(j.id)}
                        disabled={approveMut.isPending}
                      >
                        {approveMut.isPending ? "Approving..." : "Approve"}
                      </button>
                    )}

                    {j.status === "APPROVED" && (
                      <button
                        className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-50"
                        onClick={() => postMut.mutate(j.id)}
                        disabled={postMut.isPending}
                      >
                        {postMut.isPending ? "Posting..." : "Post"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-5 py-4 text-left">Journal No</th>
                  <th className="px-5 py-4 text-left">Type</th>
                  <th className="px-5 py-4 text-left">Date</th>
                  <th className="px-5 py-4 text-left">Period</th>
                  <th className="px-5 py-4 text-left">Status</th>
                  <th className="px-5 py-4 text-right">Debit</th>
                  <th className="px-5 py-4 text-right">Credit</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {isLoading ? (
                  <tr>
                    <td
                      className="px-5 py-10 text-center text-slate-600"
                      colSpan={8}
                    >
                      Loading...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td
                      className="px-5 py-10 text-center text-slate-600"
                      colSpan={8}
                    >
                      No journals
                    </td>
                  </tr>
                ) : (
                  rows.map((j: any) => (
                    <tr key={j.id}>
                      <td className="px-5 py-4 font-medium text-slate-900">
                        {j.journalNo}
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        {j.journalType}
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        {j.transactionDate}
                      </td>
                      <td className="px-5 py-4 text-slate-700">{j.period}</td>
                      <td className="px-5 py-4">
                        <span
                          className={[
                            "rounded-full border px-2.5 py-1 text-xs font-semibold",
                            statusClass(j.status),
                          ].join(" ")}
                        >
                          {j.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums text-slate-900">
                        {money(j.totalDebit)}
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums text-slate-900">
                        {money(j.totalCredit)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex flex-wrap justify-end gap-2">
                          <button
                            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50"
                            onClick={() => downloadVoucher(j.id, j.journalNo)}
                          >
                            Voucher
                          </button>

                          {j.status === "DRAFT" && (
                            <>
                              <Link
                                to={`/journals/${j.id}/edit`}
                                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50"
                              >
                                Edit
                              </Link>
                              <button
                                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50"
                                onClick={() => submitMut.mutate(j.id)}
                                disabled={submitMut.isPending}
                              >
                                Submit
                              </button>
                            </>
                          )}

                          {j.status === "SUBMITTED" && (
                            <button
                              className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50"
                              onClick={() => approveMut.mutate(j.id)}
                              disabled={approveMut.isPending}
                            >
                              Approve
                            </button>
                          )}

                          {j.status === "APPROVED" && (
                            <button
                              className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50"
                              onClick={() => postMut.mutate(j.id)}
                              disabled={postMut.isPending}
                            >
                              Post
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile sticky action */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-3">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-800">Journals</div>
            <div className="truncate text-xs text-slate-500">
              {rows.length} result{rows.length === 1 ? "" : "s"}
            </div>
          </div>

          <Link
            to="/finance-report/new-journal"
            className="shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black"
          >
            New Journal
          </Link>
        </div>
      </div>
    </div>
  );
}
