import { useState } from "react";

export function Menu<T>({ actions, row }: { actions: any[]; row: T }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded hover:bg-slate-100"
      >
        <i className="fas fa-ellipsis-v"></i>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-md bg-white shadow-lg border z-20">
          {actions.map((a, i) => (
            <button
              key={i}
              onClick={() => {
                a.onClick(row);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-slate-100"
            >
              {a.icon && <i className={`fas ${a.icon}`} />}
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
