import React from "react";

interface SignerProps {
  firstName?: string;
  lastName?: string;
  position?: string;
  department?: string;
  date?: string;
  label?: LabelKey;
  className?: string;
}

const labelMapper = {
  Recommend: "Recommended by",
  Approve: "Approved by",
  Acknolwedge: "Acknowledged by",
  Request: "Requested by",
};

export type LabelKey = keyof typeof labelMapper;

const getInitials = (first?: string, last?: string) =>
  `${(first?.[0] || "").toUpperCase()}${(last?.[0] || "").toUpperCase()}` ||
  "•";

const Signer: React.FC<SignerProps> = ({
  firstName,
  lastName,
  position,
  department,
  date,
  label = "Approve",
  className = "",
}) => {
  const initials = getInitials(firstName, lastName);

  console.log("======DATE==eee=====", date);

  return (
    <div
      className={[
        "w-full max-w-sm rounded-xl bg-white",
        "shadow-sm ring-1 ring-gray-200 hover:shadow-md hover:ring-gray-300",
        "transition-all duration-200",
        "p-4",
        className,
      ].join(" ")}
      role="group"
      aria-label={`${label} card`}
    >
      {/* Badge */}
      <div className="mb-3 flex items-center justify-between">
        <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-700 tracking-wide">
          {labelMapper[label]}
        </span>
        <span className="rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-200">
          {date}
        </span>
      </div>

      {/* Identity */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 ring-1 ring-inset ring-indigo-300/60 flex items-center justify-center">
          <span className="text-sm font-semibold text-indigo-700">
            {initials}
          </span>
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-gray-900">
            {[firstName, lastName].filter(Boolean).join(" ") || "—"}
          </h2>
          <p className="truncate text-xs text-gray-600">{position || ""}</p>
          <p className="truncate text-xs text-gray-600">{department || ""}</p>
        </div>
      </div>
    </div>
  );
};

export default Signer;
