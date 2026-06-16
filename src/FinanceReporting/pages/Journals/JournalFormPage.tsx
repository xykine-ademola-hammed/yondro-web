import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAccounts,
  useJournal,
  useSaveJournal,
  useUnits,
  useUpdateJournal,
} from "../../api/financeHooks";
import type { JournalType } from "../../api/types";

type Line = {
  id?: string;
  accountId: string;
  debit: number;
  credit: number;
  lineNarration?: string;
};

type JournalForm = {
  unitId: string;
  journalType: JournalType;
  transactionDate: string; // YYYY-MM-DD
  period: string; // YYYY-MM
  referenceNo?: string;
  description?: string;
  lines: Line[];
};

function sum(n: number[]) {
  return n.reduce((a, b) => a + b, 0);
}

function fmtMoney(n: number) {
  if (!Number.isFinite(n)) return "0.00";
  return n.toFixed(2);
}

export default function JournalFormPage({ mode }: { mode: "create" | "edit" }) {
  const nav = useNavigate();
  const params = useParams();
  const journalId = params.id as string | undefined;

  const { data: units } = useUnits();
  const { data: existing, isLoading: loadingJournal } = useJournal(
    mode === "edit" ? journalId : undefined,
  );

  const [unitId, setUnitId] = useState("");
  const { data: accounts } = useAccounts(unitId || undefined);

  const saveMut = useSaveJournal(unitId as any);
  const updateMut = useUpdateJournal(unitId as any);

  const [form, setForm] = useState<JournalForm>({
    unitId: "",
    journalType: "EXPENDITURE",
    transactionDate: new Date().toISOString().slice(0, 10),
    period: new Date().toISOString().slice(0, 7),
    referenceNo: "",
    description: "",
    lines: [{ accountId: "", debit: 0, credit: 0, lineNarration: "" }],
  });

  // Load existing journal into form
  useEffect(() => {
    if (mode !== "edit") return;
    if (!existing) return;

    const hdr = (existing as any).header ?? existing;
    const lines = (existing as any).lines ?? (hdr as any).lines ?? [];

    setUnitId(hdr.unitId);
    setForm({
      unitId: hdr.unitId,
      journalType: hdr.journalType,
      transactionDate: hdr.transactionDate,
      period: hdr.period,
      referenceNo: hdr.reference_no ?? "",
      description: hdr.description ?? "",
      lines: lines.length
        ? lines.map((l: any) => ({
            id: l.id,
            accountId: l.account_id,
            debit: Number(l.debit),
            credit: Number(l.credit),
            lineNarration: l.lineNarration ?? "",
          }))
        : [{ accountId: "", debit: 0, credit: 0, lineNarration: "" }],
    });
  }, [existing, mode]);

  // keep unitId in sync
  useEffect(() => {
    setForm((s) => ({ ...s, unitId: unitId }));
  }, [unitId]);

  const totals = useMemo(() => {
    const totalDebit = sum(form.lines.map((l) => Number(l.debit || 0)));
    const totalCredit = sum(form.lines.map((l) => Number(l.credit || 0)));
    return {
      totalDebit,
      totalCredit,
      balanced: Math.abs(totalDebit - totalCredit) < 0.0001 && totalDebit > 0,
    };
  }, [form.lines]);

  const accountOptions = (accounts?.data ?? []).filter(
    (a: any) => a.status === "ACTIVE",
  );

  function addLine() {
    setForm((s) => ({
      ...s,
      lines: [
        ...s.lines,
        { accountId: "", debit: 0, credit: 0, lineNarration: "" },
      ],
    }));
  }

  function removeLine(idx: number) {
    setForm((s) => {
      const lines = s.lines.slice();
      lines.splice(idx, 1);
      return {
        ...s,
        lines: lines.length
          ? lines
          : [{ accountId: "", debit: 0, credit: 0, lineNarration: "" }],
      };
    });
  }

  function setLine(idx: number, patch: Partial<Line>) {
    setForm((s) => {
      const lines = s.lines.slice();
      lines[idx] = { ...lines[idx], ...patch };
      return { ...s, lines };
    });
  }

  function normalizePeriodFromDate(date: string) {
    return date.slice(0, 7);
  }

  function canSubmit() {
    if (!form.unitId) return false;
    if (!form.transactionDate) return false;
    if (!form.period) return false;
    if (!totals.balanced) return false;
    if (form.lines.some((l) => !l.accountId)) return false;
    return true;
  }

  async function onSave() {
    if (!form.unitId) return alert("Select unit");
    if (!form.transactionDate) return alert("Enter transaction date");
    if (!form.period) return alert("Enter period");
    if (!totals.balanced)
      return alert(
        "Journal must balance (Total Debit = Total Credit) and be > 0",
      );
    if (form.lines.some((l) => !l.accountId))
      return alert("All lines must have account");

    const payload = {
      unitId: form.unitId,
      journalType: form.journalType,
      transactionDate: form.transactionDate,
      period: form.period,
      referenceNo: form.referenceNo || null,
      description: form.description || null,
      lines: form.lines.map((l, i) => ({
        id: l.id,
        lineNo: i + 1,
        accountId: l.accountId,
        debit: Number(l.debit || 0),
        credit: Number(l.credit || 0),
        lineNarration: l.lineNarration || null,
      })),
    };

    if (mode === "create") {
      await saveMut.mutateAsync(payload);
      nav(-1);
    } else {
      if (!journalId) return;
      await updateMut.mutateAsync({ id: journalId, payload });
      nav(-1);
    }
  }

  const isSaving = saveMut.isPending || updateMut.isPending;

  return (
    <div className="mx-auto w-full max-w-5xl px-3 pb-24 pt-4 sm:px-6 sm:pb-8">
      <div className="rounded-2xl border bg-white shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
              {mode === "create" ? "New Journal" : "Edit Journal"}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Add lines, ensure DR = CR, then save as draft.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => nav(-1)}
            >
              Back
            </button>

            {/* Desktop primary action */}
            <button
              onClick={onSave}
              disabled={!canSubmit() || isSaving || !unitId}
              className="hidden rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-50 sm:inline-flex"
            >
              {mode === "create"
                ? isSaving
                  ? "Saving..."
                  : "Save Draft"
                : isSaving
                  ? "Updating..."
                  : "Update Draft"}
            </button>
          </div>
        </div>

        {mode === "edit" && loadingJournal ? (
          <div className="p-4 text-sm text-gray-600 sm:p-6">
            Loading journal...
          </div>
        ) : (
          <>
            {/* Summary chips */}
            <div className="flex flex-wrap items-center gap-2 px-4 pt-4 sm:px-6">
              <span
                className={[
                  "rounded-full border px-2.5 py-1 text-xs font-medium",
                  totals.balanced
                    ? "border-green-300 bg-green-50 text-green-700"
                    : "border-rose-300 bg-rose-50 text-rose-700",
                ].join(" ")}
              >
                {totals.balanced ? "Balanced" : "Not balanced"}
              </span>

              <span className="rounded-full border bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700">
                DR: {fmtMoney(totals.totalDebit)}
              </span>
              <span className="rounded-full border bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700">
                CR: {fmtMoney(totals.totalCredit)}
              </span>
            </div>

            {/* Header form fields */}
            <div className="grid grid-cols-1 gap-3 p-4 sm:p-6 md:grid-cols-4">
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-gray-700">
                  Unit
                </label>
                <select
                  className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                  disabled={mode === "edit"}
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
                <label className="text-xs font-medium text-gray-700">
                  Journal Type
                </label>
                <select
                  className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  value={form.journalType}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      journalType: e.target.value as any,
                    }))
                  }
                >
                  <option value="REVENUE">REVENUE</option>
                  <option value="EXPENDITURE">EXPENDITURE</option>
                  <option value="SALARY">SALARY</option>
                  <option value="STORE">STORE</option>
                  <option value="LOAN_ADVANCE">LOAN_ADVANCE</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700">
                  Transaction Date
                </label>
                <input
                  className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  type="date"
                  value={form.transactionDate}
                  onChange={(e) => {
                    const d = e.target.value;
                    setForm((s) => ({
                      ...s,
                      transactionDate: d,
                      period: normalizePeriodFromDate(d),
                    }));
                  }}
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-medium text-gray-700">
                  Reference No
                </label>
                <input
                  className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  value={form.referenceNo ?? ""}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, referenceNo: e.target.value }))
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-medium text-gray-700">
                  Period
                </label>
                <input
                  className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  value={form.period}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, period: e.target.value }))
                  }
                  placeholder="YYYY-MM"
                  inputMode="numeric"
                />
              </div>

              <div className="md:col-span-4">
                <label className="text-xs font-medium text-gray-700">
                  Description
                </label>
                <input
                  className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  value={form.description ?? ""}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, description: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Lines */}
            <div className="border-t p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    Lines
                  </div>
                  <div className="mt-0.5 text-xs text-gray-600">
                    Tip: enter either Debit or Credit per line.
                  </div>
                </div>
                <button
                  className="rounded-lg border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={addLine}
                >
                  Add line
                </button>
              </div>

              {/* Mobile cards */}
              <div className="mt-4 space-y-3 md:hidden">
                {form.lines.map((l, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-xs font-semibold text-gray-700">
                        Line {idx + 1}
                      </div>
                      <button
                        className="rounded-lg border px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        onClick={() => removeLine(idx)}
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mt-3">
                      <label className="text-xs font-medium text-gray-700">
                        Account
                      </label>
                      <select
                        className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm"
                        value={l.accountId}
                        onChange={(e) =>
                          setLine(idx, { accountId: e.target.value })
                        }
                        disabled={!unitId}
                      >
                        <option value="">Select account</option>
                        {accountOptions.map((a: any) => (
                          <option key={a.id} value={a.id}>
                            {a.accountCode} - {a.accountName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-700">
                          Debit
                        </label>
                        <input
                          className="mt-1 w-full rounded-xl border px-3 py-2.5 text-right text-sm"
                          type="number"
                          min={0}
                          step="0.01"
                          value={l.debit}
                          onChange={(e) => {
                            const v = Number(e.target.value || 0);
                            setLine(idx, {
                              debit: v,
                              credit: v > 0 ? 0 : l.credit,
                            });
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">
                          Credit
                        </label>
                        <input
                          className="mt-1 w-full rounded-xl border px-3 py-2.5 text-right text-sm"
                          type="number"
                          min={0}
                          step="0.01"
                          value={l.credit}
                          onChange={(e) => {
                            const v = Number(e.target.value || 0);
                            setLine(idx, {
                              credit: v,
                              debit: v > 0 ? 0 : l.debit,
                            });
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="text-xs font-medium text-gray-700">
                        Narration
                      </label>
                      <input
                        className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm"
                        value={l.lineNarration ?? ""}
                        onChange={(e) =>
                          setLine(idx, { lineNarration: e.target.value })
                        }
                      />
                    </div>
                  </div>
                ))}

                <div className="rounded-2xl border bg-gray-50 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-gray-900">Totals</span>
                    <span
                      className={[
                        "rounded-full border px-2 py-1 text-xs font-medium",
                        totals.balanced
                          ? "border-green-300 bg-green-50 text-green-700"
                          : "border-rose-300 bg-rose-50 text-rose-700",
                      ].join(" ")}
                    >
                      {totals.balanced ? "Balanced" : "Not balanced"}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-700">
                    <div className="flex items-center justify-between rounded-xl border bg-white px-3 py-2">
                      <span>Debit</span>
                      <span className="font-semibold">
                        {fmtMoney(totals.totalDebit)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border bg-white px-3 py-2">
                      <span>Credit</span>
                      <span className="font-semibold">
                        {fmtMoney(totals.totalCredit)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop table */}
              <div className="mt-4 hidden overflow-x-auto md:block">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Account</th>
                      <th className="px-3 py-2 text-right">Debit</th>
                      <th className="px-3 py-2 text-right">Credit</th>
                      <th className="px-3 py-2 text-left">Narration</th>
                      <th className="px-3 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.lines.map((l, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-3 py-2">
                          <select
                            className="w-full rounded-lg border px-2 py-1.5"
                            value={l.accountId}
                            onChange={(e) =>
                              setLine(idx, { accountId: e.target.value })
                            }
                            disabled={!unitId}
                          >
                            <option value="">Select account</option>
                            {accountOptions.map((a: any) => (
                              <option key={a.id} value={a.id}>
                                {a.accountCode} - {a.accountName}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input
                            className="w-28 rounded-lg border px-2 py-1.5 text-right"
                            type="number"
                            min={0}
                            step="0.01"
                            value={l.debit}
                            onChange={(e) => {
                              const v = Number(e.target.value || 0);
                              setLine(idx, {
                                debit: v,
                                credit: v > 0 ? 0 : l.credit,
                              });
                            }}
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input
                            className="w-28 rounded-lg border px-2 py-1.5 text-right"
                            type="number"
                            min={0}
                            step="0.01"
                            value={l.credit}
                            onChange={(e) => {
                              const v = Number(e.target.value || 0);
                              setLine(idx, {
                                credit: v,
                                debit: v > 0 ? 0 : l.debit,
                              });
                            }}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            className="w-full rounded-lg border px-2 py-1.5"
                            value={l.lineNarration ?? ""}
                            onChange={(e) =>
                              setLine(idx, { lineNarration: e.target.value })
                            }
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            className="rounded-lg border px-2 py-1 hover:bg-gray-50"
                            onClick={() => removeLine(idx)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  <tfoot>
                    <tr className="border-t bg-gray-50">
                      <td className="px-3 py-2 font-semibold">Totals</td>
                      <td className="px-3 py-2 text-right font-semibold">
                        {fmtMoney(totals.totalDebit)}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold">
                        {fmtMoney(totals.totalCredit)}
                      </td>
                      <td className="px-3 py-2" colSpan={2}>
                        <span
                          className={[
                            "rounded-full border px-2 py-1 text-xs font-medium",
                            totals.balanced
                              ? "border-green-300 bg-green-50 text-green-700"
                              : "border-rose-300 bg-rose-50 text-rose-700",
                          ].join(" ")}
                        >
                          {totals.balanced ? "Balanced" : "Not balanced"}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mobile sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-3 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={[
                  "rounded-full border px-2 py-1 text-xs font-medium",
                  totals.balanced
                    ? "border-green-300 bg-green-50 text-green-700"
                    : "border-rose-300 bg-rose-50 text-rose-700",
                ].join(" ")}
              >
                {totals.balanced ? "Balanced" : "Not balanced"}
              </span>
              <span className="truncate text-xs text-gray-600">
                DR {fmtMoney(totals.totalDebit)} • CR{" "}
                {fmtMoney(totals.totalCredit)}
              </span>
            </div>
          </div>

          <button
            onClick={onSave}
            disabled={!canSubmit() || isSaving || !unitId}
            className="shrink-0 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {mode === "create"
              ? isSaving
                ? "Saving..."
                : "Save Draft"
              : isSaving
                ? "Updating..."
                : "Update Draft"}
          </button>
        </div>
      </div>
    </div>
  );
}
