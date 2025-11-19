import { useOrganization } from "../GlobalContexts/Organization-Context";
import type { WorkFlow } from "../common/types";

type RequestTypeSelectorProps = {
  value: WorkFlow | null;
  onChange: (workflow: WorkFlow | null) => void;
  error?: string;
};

export default function RequestTypeSelector({
  value,
  onChange,
  error,
}: RequestTypeSelectorProps) {
  const { workflows } = useOrganization();

  return (
    <div className="w-full">
      <label className="mb-1 block text-xs font-medium text-slate-600">
        Request Type
      </label>

      <div className="relative">
        <select
          value={value?.id ?? ""}
          onChange={(e) => {
            const selected = workflows?.rows.find(
              (w) => Number(w.id) === Number(e.target.value)
            );
            onChange(selected || null);
          }}
          className={`w-full px-2 py-2 border rounded-lg bg-white appearance-none cursor-pointer 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${
              error ? "border-red-300" : "border-gray-300"
            } block text-sm text-slate-500`}
        >
          <option value="">All Types</option>

          {workflows.rows.map((workflow) => (
            <option key={workflow.id} value={workflow.id}>
              {workflow.name}
            </option>
          ))}
        </select>

        {/* Dropdown icon */}
        <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
