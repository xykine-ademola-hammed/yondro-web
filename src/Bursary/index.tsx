import { useState } from "react";
import VoucherList from "../vouchers/VoucherList";
import VoteBookManagement from "../votebook/VoteBookManagement";
import BudgetAdjustmentList from "../budget-adjustments/BudgetAdjustmentList";
import NcoaCodesList from "../ncoa/NcoaCodesList";
import FiscalYearManagement from "../FiscalYear/FiscalYearManagement";
import ResponsiveTabs from "../components/ui/ResponsiveTabs";

export default function BursaryManagement() {
  const [activeTab, setActiveTab] = useState("Vote Book");

  const tabNames = [
    "Vote Book",
    "Vouchers",
    "Budget Adjustments",
    "NCOA Codes",
    "Fiscal Years",
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Busary Management
        </h1>
        <p className="text-gray-600">Manage the bursary unit activities.</p>
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
