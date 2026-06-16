import { useState } from "react";
import VoucherList from "./vouchers/VoucherList";
import VoteBookManagement from "./votebook/VoteBookManagement";
import FiscalYearManagement from "./FiscalYear/FiscalYearManagement";
import ResponsiveTabs from "../components/ui/ResponsiveTabs";
import BudgetAdjustmentList from "./budget-adjustments/BudgetAdjustmentList";
import NcoaCodesList from "./ncoa/NcoaCodesList";

export default function FinanceManagement() {
  const [activeTab, setActiveTab] = useState("Vote Book");

  const tabNames = [
    "Vouchers",
    "Cashbook",
    "Vote Book",
    "Budget Adjustments",
    "Fiscal Years",
    "NCOA Codes",
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Finance Documentation
        </h1>
        <p className="text-gray-600">Manage the finance unit activities.</p>
      </div>

      <ResponsiveTabs
        setActiveTab={setActiveTab}
        tabNames={tabNames}
        activeTab={activeTab}
      />

      <div className="p-6">
        {activeTab === "Vote Book" && <VoteBookManagement />}
        {activeTab === "Vouchers" && <VoucherList />}
        {activeTab === "Budget Adjustments" && <BudgetAdjustmentList />}
        {activeTab === "NCOA Codes" && <NcoaCodesList />}
        {activeTab === "Fiscal Years" && <FiscalYearManagement />}
      </div>
    </div>
  );
}
