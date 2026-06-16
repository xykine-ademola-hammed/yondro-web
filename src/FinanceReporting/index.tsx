import ResponsiveTabs from "../components/ui/ResponsiveTabs";
import JournalsPage from "./pages/Journals/JournalsPage";
import AccountsPage from "./pages/Accounts/AccountsPage";
import PeriodsPage from "./pages/Periods/PeriodsPage";
import UnitsPage from "./pages/FinanceUnits/UnitsPage";
import ReportsPage from "./pages/Reports/ReportsPage";
import { useState } from "react";

export default function FinanceReporting() {
  const [activeTab, setActiveTab] = useState("Journals");

  const tabNames = [
    // "Dashboard",
    "Journals",
    "Accounts",
    "Periods",
    "Finance Units",
    "Report",
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Finance Reporting
        </h1>
        <p className="text-gray-600">Manage the finance unit activities.</p>
      </div>

      <ResponsiveTabs
        setActiveTab={setActiveTab}
        tabNames={tabNames}
        activeTab={activeTab}
      />

      <div className="p-6">
        {/* {activeTab === "Dashboard" && <FinanceDashboard />} */}
        {activeTab === "Journals" && <JournalsPage />}
        {activeTab === "Accounts" && <AccountsPage />}
        {activeTab === "Periods" && <PeriodsPage />}
        {activeTab === "Finance Units" && <UnitsPage />}
        {activeTab === "Report" && <ReportsPage />}
      </div>
    </div>
  );
}
