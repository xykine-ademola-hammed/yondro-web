import { useEffect, useMemo, useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
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
  BellIcon,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "../ui/Button";
import { OrganizationProvider } from "../../GlobalContexts/Organization-Context";
import { useAuth } from "../../GlobalContexts/AuthContext";

export interface NavigationItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  children?: NavigationItem[];
}

const adminNavigation: NavigationItem[] = [
  { name: "Home", href: "/", icon: Home },
  { name: "Workflows", href: "/workflows", icon: Workflow },
  { name: "Requests", href: "/requests", icon: FileText },
  { name: "Forms", href: "/forms", icon: FileText },
  { name: "Organization", href: "/organization", icon: Building2 },
  {
    name: "Finance",
    icon: BookOpen,
    children: [
      { name: "Documentation", href: "/finance", icon: BookOpen },
      { name: "Reporting", href: "/finance-report", icon: UserIcon },
      { name: "Asset Register", href: "/asset-register", icon: BookOpen },
    ],
  },
  // { name: "Procurement", href: "/procurement", icon: BookOpen },
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

  const currentItem = useMemo(() => {
    const findItem = (items: NavigationItem[]): NavigationItem | undefined => {
      for (const item of items) {
        if (
          item.href &&
          (location.pathname === item.href ||
            location.pathname.startsWith(item.href + "/"))
        ) {
          return item;
        }
        if (item.children) {
          const found = findItem(item.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    return findItem(navItems);
  }, [navItems, location.pathname]);

  return (
    <OrganizationProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        {/* Mobile sidebar */}
        <div
          className={`lg:hidden ${sidebarOpen ? "fixed inset-0 z-50" : "hidden"
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
                {/* <Breadcrumbs pathname={location.pathname} /> */}
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
              <div className="items-center gap-3 flex">
                <button
                  type="button"
                  onClick={() => navigate("/notifications")}
                  className="relative flex items-center justify-center bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full text-sm h-9 px-4"
                >
                  <BellIcon className="h-5 w-5" />

                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-semibold h-4 w-4 flex items-center justify-center rounded-full">
                    {0}
                  </span>
                </button>
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
      {items.map((item) => (
        <NavItem key={item.name} item={item} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}

function NavItem({
  item,
  depth = 0,
  onNavigate,
}: {
  item: NavigationItem;
  depth?: number;
  onNavigate?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;

  // Check if any child is active
  const isChildActive = useMemo(() => {
    if (!hasChildren) return false;
    return item.children?.some(
      (child) =>
        location.pathname === child.href ||
        location.pathname.startsWith(child.href + "/"),
    );
  }, [item.children, location.pathname, hasChildren]);

  useEffect(() => {
    if (isChildActive) setIsOpen(true);
  }, [isChildActive]);

  const toggle = () => setIsOpen(!isOpen);

  const baseStyles =
    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition cursor-pointer";
  const activeStyles =
    "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-100";
  const inactiveStyles = "text-slate-600 hover:bg-slate-50 hover:text-slate-900";

  if (hasChildren) {
    return (
      <div className="space-y-1">
        <div
          onClick={toggle}
          className={`${baseStyles} ${isChildActive ? activeStyles : inactiveStyles}`}
        >
          <Icon className="h-5 w-5 shrink-0 opacity-80 group-hover:opacity-100" />
          <span className="truncate flex-1">{item.name}</span>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-400" />
          )}
        </div>
        {isOpen && (
          <div className="ml-4 space-y-1 border-l border-slate-100 pl-4">
            {item.children?.map((child) => (
              <NavItem
                key={child.name}
                item={child}
                depth={depth + 1}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.href || "#"}
      end={item.href === "/"}
      onClick={onNavigate}
      className={({ isActive }) =>
        `${baseStyles} ${isActive ? activeStyles : inactiveStyles}`
      }
    >
      <Icon className="h-5 w-5 shrink-0 opacity-80 group-hover:opacity-100" />
      <span className="truncate">{item.name}</span>
    </NavLink>
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

// function Breadcrumbs({ pathname }: { pathname: string }) {
//   const segments = pathname.split("/").filter(Boolean); // remove empty
//   // Home always first
//   const crumbs = [
//     { label: "Home", to: "/" },
//     ...segments.map((seg, idx) => {
//       const to = "/" + segments.slice(0, idx + 1).join("/");
//       const label = seg
//         .replace(/-/g, " ")
//         .replace(/\b\w/g, (m) => m.toUpperCase());
//       return { label, to };
//     }),
//   ];
//   return (
//     <nav aria-label="Breadcrumb" className="flex items-center gap-2">
//       {crumbs.map((c, i) => {
//         const isLast = i === crumbs.length - 1;
//         return (
//           <div key={c.to} className="flex items-center">
//             {i !== 0 && (
//               <ChevronRight className="mx-1 h-4 w-4 text-slate-300" />
//             )}
//             {isLast ? (
//               <span className="truncate text-xs font-medium text-slate-700">
//                 {c.label}
//               </span>
//             ) : (
//               <Link
//                 to={c.to}
//                 className="truncate text-xs text-slate-500 hover:text-slate-800"
//               >
//                 {c.label}
//               </Link>
//             )}
//           </div>
//         );
//       })}
//     </nav>
//   );
// }
