import { useEffect, useMemo, useState } from "react";
import {
  Outlet,
  NavLink,
  useLocation,
  useNavigate,
  Link,
} from "react-router-dom";
import {
  Menu,
  Home,
  Workflow,
  FileText,
  Building2,
  LogOut,
  UserIcon,
  BookOpen,
  X,
  ChevronRight,
} from "lucide-react";
import { Button } from "../ui/Button";
import { OrganizationProvider } from "../../GlobalContexts/Organization-Context";
import { useAuth } from "../../GlobalContexts/AuthContext";

export interface NavigationItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const adminNavigation: NavigationItem[] = [
  { name: "Home", href: "/", icon: Home },
  { name: "Workflows", href: "/workflows", icon: Workflow },
  { name: "Requests", href: "/requests", icon: FileText },
  { name: "Forms", href: "/forms", icon: FileText },
  { name: "Organization", href: "/organization", icon: Building2 },
  { name: "Bursary", href: "/bursary", icon: BookOpen },
  { name: "Profile", href: "/profile", icon: UserIcon },
];

const employeeNavigation: NavigationItem[] = [
  { name: "Home", href: "/", icon: Home },
  { name: "Requests", href: "/requests", icon: FileText },
  { name: "Profile", href: "/profile", icon: UserIcon },
];

export function LayoutNew() {
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === "Employee") setNavItems(employeeNavigation);
    else setNavItems(adminNavigation);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const currentItem = useMemo(
    () =>
      navItems.find(
        (n) =>
          location.pathname === n.href ||
          location.pathname.startsWith(n.href + "/")
      ),
    [navItems, location.pathname]
  );

  return (
    <OrganizationProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        {/* Mobile sidebar */}
        <div
          className={`lg:hidden ${
            sidebarOpen ? "fixed inset-0 z-50" : "hidden"
          }`}
        >
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl ring-1 ring-slate-200">
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
              <Brand />
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav
              items={navItems}
              onNavigate={() => setSidebarOpen(false)}
            />
            <SidebarUserCard user={user ?? undefined} onLogout={handleLogout} />
          </aside>
        </div>

        {/* Desktop sidebar */}
        <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
          <div className="relative flex h-full flex-col overflow-y-auto border-r border-slate-200 bg-white/90 backdrop-blur">
            <div className="flex h-16 items-center border-b border-slate-200 px-6">
              <Brand />
            </div>
            <SidebarNav items={navItems} />
            <SidebarUserCard user={user ?? undefined} onLogout={handleLogout} />
          </div>
        </aside>

        {/* Main area */}
        <div className="lg:pl-72">
          {/* Top bar */}
          <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
            <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
              <button
                className="-m-2.5 rounded-md p-2.5 text-slate-700 lg:hidden hover:bg-slate-100"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Breadcrumbs + Title */}
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Breadcrumbs pathname={location.pathname} />
                <div className="hidden shrink-0 items-center gap-2 md:flex">
                  {currentItem?.icon && (
                    <currentItem.icon className="h-4 w-4 text-indigo-600" />
                  )}
                  <h1 className="truncate text-sm font-semibold text-slate-900">
                    {currentItem?.name ?? "Dashboard"}
                  </h1>
                </div>
              </div>

              {/* Right area (quick actions placeholder) */}
              <div className="hidden items-center gap-3 md:flex">
                <Link
                  to="/new-request"
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                >
                  Create Request
                </Link>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </OrganizationProvider>
  );
}

/* ============ Subcomponents ============ */

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
        <span className="text-sm font-bold">EX</span>
      </div>
      <div>
        <p className="text-base font-semibold leading-tight text-slate-900">
          EduXora
        </p>
        <p className="text-[11px] leading-none text-slate-500">
          Workflow Suite
        </p>
      </div>
    </div>
  );
}

function SidebarNav({
  items,
  onNavigate,
}: {
  items: NavigationItem[];
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === "/"}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              ].join(" ")
            }
          >
            <Icon className="h-5 w-5 shrink-0 opacity-80 group-hover:opacity-100" />
            <span className="truncate">{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

function SidebarUserCard({
  user,
  onLogout,
}: {
  user?: { firstName?: string; lastName?: string; role?: string };
  onLogout: () => void;
}) {
  const initials =
    `${(user?.firstName?.[0] ?? "").toUpperCase()}${(
      user?.lastName?.[0] ?? ""
    ).toUpperCase()}` || "U";
  return (
    <div className="border-t border-slate-200 p-4">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 ring-1 ring-inset ring-indigo-200">
          <span className="text-xs font-semibold">{initials}</span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="truncate text-xs text-slate-500">{user?.role}</p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onLogout}
        className="w-full justify-center"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </div>
  );
}

function Breadcrumbs({ pathname }: { pathname: string }) {
  const segments = pathname.split("/").filter(Boolean); // remove empty
  // Home always first
  const crumbs = [
    { label: "Home", to: "/" },
    ...segments.map((seg, idx) => {
      const to = "/" + segments.slice(0, idx + 1).join("/");
      const label = seg
        .replace(/-/g, " ")
        .replace(/\b\w/g, (m) => m.toUpperCase());
      return { label, to };
    }),
  ];
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2">
      {crumbs.map((c, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <div key={c.to} className="flex items-center">
            {i !== 0 && (
              <ChevronRight className="mx-1 h-4 w-4 text-slate-300" />
            )}
            {isLast ? (
              <span className="truncate text-xs font-medium text-slate-700">
                {c.label}
              </span>
            ) : (
              <Link
                to={c.to}
                className="truncate text-xs text-slate-500 hover:text-slate-800"
              >
                {c.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
