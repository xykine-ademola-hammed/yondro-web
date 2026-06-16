export default function FinanceDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border bg-white p-4">
        <div className="text-sm text-gray-600">Quick actions</div>
        <div className="mt-3 space-y-2 text-sm">
          <div>• Create a journal (Draft → Submit → Approve → Post)</div>
          <div>
            • Download monthly statements (Cashbook, TB, I&E, Balance Sheet)
          </div>
          <div>• Close period after all journals are posted</div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <div className="text-sm text-gray-600">Notes</div>
        <div className="mt-3 space-y-2 text-sm">
          <div>
            • Posted journals are immutable (use reversal journal to correct).
          </div>
          <div>• Trial Balance must balance before period close.</div>
          <div>• Ledger/Cashbook drilldown comes from GL entries.</div>
        </div>
      </div>
    </div>
  );
}
