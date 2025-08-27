import {
  Route,
  BrowserRouter as Router,
  Routes,
  Navigate,
} from "react-router-dom";
import Dashboard from "./Dashboard";
import AppContextProvider from "./GlobalContexts/AppContext";
import NewRequest from "./Dashboard/new-request";
import RequestList from "./Request";
import Workflow from "./WorkFlow";
import Forms from "./Forms";
import FormEditor from "./Forms/widgets/FormCreatorEditor";
import WorkflowDetail from "./WorkFlow/widgets/WorkflowDetail";
import Home from "./LandingPage";
import ProtectedPages from "./ProtectedPages";
import { AuthContextProvider, useAuth } from "./GlobalContexts/AuthContext";
import AddEditWorkflow from "./WorkFlow/AddEditWorkflow";
import Organization from "./Organization";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SuperAdmin from "./SuperAdmin";
import { ToastProvider } from "./GlobalContexts/ToastContext";
import RequestDetailView from "./components/RequestDetailView";
import { LoadingPage } from "./components/ui/LoadingSpinner";
import { LayoutNew } from "./components/layout/Layout";
import WorkflowDetail2 from "./components/RequestDetailView2";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingPage />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Home />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthContextProvider>
          <AppContextProvider>
            <ToastProvider>
              <Routes>
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      {/* <PaymentVoucherForm /> */}
                      <Home />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <LayoutNew />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/" element={<ProtectedPages />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/new-request" element={<NewRequest />} />

                    <Route
                      path="/request-response/:requestId"
                      element={<WorkflowDetail2 />}
                    />
                    <Route
                      path="/requests/request-response/:requestId/:urlMode"
                      element={<WorkflowDetail2 />}
                    />

                    <Route path="/requests" element={<RequestList />} />
                    <Route path="/workflows" element={<Workflow />} />
                    <Route
                      path="/workflows/:workflowId"
                      element={<WorkflowDetail />}
                    />
                    <Route
                      path="/workflows/add-edit/:workflowId"
                      element={<AddEditWorkflow />}
                    />

                    <Route path="/forms" element={<Forms />} />
                    <Route path="/forms/:formId" element={<FormEditor />} />
                    <Route path="/organization" element={<Organization />} />
                    <Route path="/super-admin" element={<SuperAdmin />} />
                  </Route>
                </Route>
              </Routes>
            </ToastProvider>
          </AppContextProvider>
        </AuthContextProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
