import { useState, useRef, useEffect } from "react";

export function Menu<T>({ actions, row }: { actions: any[]; row: T }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={menuRef} className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded hover:bg-slate-100"
      >
        <i className="fas fa-ellipsis-v text-gray-500"></i>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-md bg-white shadow-lg z-50">
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
