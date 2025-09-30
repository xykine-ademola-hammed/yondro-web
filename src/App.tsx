// App.tsx
import React, { lazy, Suspense } from "react";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider, useAuth } from "./GlobalContexts/AuthContext";
import AppContextProvider from "./GlobalContexts/AppContext";
import { ToastProvider } from "./GlobalContexts/ToastContext";

import { LayoutNew } from "./components/layout/Layout";
import SessionExpiryWarning from "./components/SessionExpiryWarning";
import PageNotFound from "./components/PageNotFound";

// Lazily load heavier pages to speed up initial paint
const Home = lazy(() => import("./LandingPage"));
const Dashboard = lazy(() => import("./Dashboard"));
const Profile = lazy(() => import("./Profile"));
const NewRequest = lazy(() => import("./Dashboard/new-request"));
const RequestList = lazy(() => import("./Request"));
const RequestDetail = lazy(() => import("./RequestDetail"));
const Workflow = lazy(() => import("./WorkFlow"));
const WorkflowDetail = lazy(() => import("./WorkFlow/widgets/WorkflowDetail"));
const AddEditWorkflow = lazy(() => import("./WorkFlow/AddEditWorkflow"));
const Forms = lazy(() => import("./Forms"));
const Bursary = lazy(() => import("./Bursary"));
// const FormEditor = lazy(() => import("./Forms/widgets/FormCreatorEditor"));
const Organization = lazy(() => import("./Organization"));
const SuperAdmin = lazy(() => import("./SuperAdmin"));
const ResetPassword = lazy(() => import("./components/ResetPassword"));
const ForgotPassword = lazy(() => import("./components/ForgotPassword"));
const VoucherList = lazy(() => import("./vouchers/VoucherList"));
const VoucherCreate = lazy(() => import("./vouchers/VoucherCreate"));
const VoucherDetail = lazy(() => import("./vouchers/VoucherDetail"));
const ApprovalQueue = lazy(() => import("./approvals/ApprovalQueue"));
const VoteBookManagement = lazy(() => import("./votebook/VoteBookManagement"));
const VoteBookAccountDetail = lazy(
  () => import("./votebook/VoteBookAccountDetail")
);
const BudgetAdjustmentList = lazy(
  () => import("./budget-adjustments/BudgetAdjustmentList")
);
const NcoaCodesList = lazy(() => import("./ncoa/NcoaCodesList"));
const Reports = lazy(() => import("./reports/Reports"));
const PermissionManagement = lazy(
  () => import("./Permission/PermissionManagement")
);
const FiscalYearManagement = lazy(
  () => import("./FiscalYear/FiscalYearManagement")
);

// Simple, accessible, non-blocking loader for Suspense and auth bootstrap
function FullScreenLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="grid min-h-screen place-items-center bg-white"
    >
      <div className="flex items-center gap-3">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-800" />
        <span className="text-sm text-gray-700">Loading…</span>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Send user to login and preserve the exact intended route
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    return (
      <Navigate
        to={location.pathname !== "/login" ? location.pathname : "/"}
        replace
      />
    );
  }
  return <>{children}</>;
}

function ProtectedShell() {
  // Track route when authenticated so refresh returns here
  // useRememberRoute();

  return (
    <ProtectedRoute>
      <LayoutNew />
    </ProtectedRoute>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <AppContextProvider>
            <ToastProvider>
              <SessionExpiryWarning />
              <Suspense fallback={<FullScreenLoader />}>
                <Routes>
                  {/* Public */}
                  <Route
                    path="/login"
                    element={
                      <PublicRoute>
                        <Home />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/reset"
                    element={
                      <PublicRoute>
                        <ResetPassword />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/forgot-password"
                    element={
                      <PublicRoute>
                        <ForgotPassword />
                      </PublicRoute>
                    }
                  />

                  {/* Protected shell */}
                  <Route path="/" element={<ProtectedShell />}>
                    {/* Index = dashboard */}
                    <Route index element={<Dashboard />} />

                    {/* Use relative paths inside the protected shell */}
                    <Route path="profile" element={<Profile />} />
                    <Route path="forms" element={<Forms />} />

                    <Route path="new-request" element={<NewRequest />} />

                    <Route
                      path="request-response/:requestId"
                      element={<RequestDetail />}
                    />
                    <Route
                      path="requests/request-response/:requestId/:urlMode"
                      element={<RequestDetail />}
                    />

                    <Route path="admin" element={<SuperAdmin />} />

                    <Route path="bursary" element={<Bursary />} />
                    <Route path="requests" element={<RequestList />} />
                    <Route path="workflows" element={<Workflow />} />
                    <Route
                      path="workflows/:workflowId"
                      element={<WorkflowDetail />}
                    />
                    <Route
                      path="workflows/add-edit/:workflowId"
                      element={<AddEditWorkflow />}
                    />

                    <Route path="vouchers" element={<VoucherList />} />
                    <Route path="vouchers/new" element={<VoucherCreate />} />
                    <Route path="vouchers/:id" element={<VoucherDetail />} />

                    <Route path="approvals" element={<ApprovalQueue />} />
                    <Route path="votebook" element={<VoteBookManagement />} />
                    <Route
                      path="votebook/:id"
                      element={<VoteBookAccountDetail />}
                    />

                    <Route
                      path="fiscal-years"
                      element={<FiscalYearManagement />}
                    />
                    <Route
                      path="budget-adjustments"
                      element={<BudgetAdjustmentList />}
                    />
                    <Route path="ncoa" element={<NcoaCodesList />} />
                    <Route path="reports" element={<Reports />} />
                    <Route
                      path="permissions"
                      element={<PermissionManagement />}
                    />
                    <Route path="organization" element={<Organization />} />
                    <Route path="super-admin" element={<SuperAdmin />} />
                  </Route>

                  {/* 404 */}
                  <Route path="*" element={<PageNotFound />} />
                </Routes>
              </Suspense>
            </ToastProvider>
          </AppContextProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
