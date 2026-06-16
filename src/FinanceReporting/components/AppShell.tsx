import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Settings, BookOpen, FileDown } from "lucide-react";

const nav = [
  { to: "/finance-report/", label: "Dashboard", icon: LayoutDashboard },
  {
    to: "/finance-report/setup/units",
    label: "Financial Units",
    icon: Settings,
  },
  { to: "/finance-report/setup/periods", label: "Periods", icon: Settings },
  {
    to: "/finance-report/setup/accounts",
    label: "Chart of Accounts",
    icon: Settings,
  },
  { to: "/finance-report/journals", label: "Journals", icon: BookOpen },
  { to: "/finance-report/reports", label: "Reports", icon: FileDown },
];

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-[260px_1fr]">
        <aside className="border-b bg-white md:min-h-screen md:border-b-0 md:border-r">
          <div className="p-4">
            <div className="text-lg font-bold">EduXora / Yondro</div>
            <div className="text-xs text-gray-600">Financial Reporting</div>
          </div>

          <nav className="px-2 pb-4">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "mb-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                      isActive
                        ? "bg-gray-100 font-semibold"
                        : "hover:bg-gray-50",
                    ].join(" ")
                  }
                >
                  <Icon size={16} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <main className="p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Finance</h1>
              <p className="text-sm text-gray-600">
                Journals, vouchers and monthly statements
              </p>
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
