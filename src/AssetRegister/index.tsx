import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import ResponsiveTabs from "../components/ui/ResponsiveTabs";

// Page Components
import AssetDashboardPage from "./AssetDashboardPage";
import AssetListPage from "./asset-listing/AssetListPage";
import AssetPeriodClosePage from "./asset-listing/AssetPeriodClosePage";
import AssetCategoryPage from "./asset-category/AssetCategoryPage";
import AssetReportsPage from "./asset-report/AssetReportsPage";

export const AssetPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Assets");
  const [sp] = useSearchParams();
  const unitType = sp.get("unitType") || "STORE";

  const tabNames = [
    // "Dashboard",
    "Assets",
    "Assets Categories",
    "Reports",
    // "Period Close",
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 bg-slate-50/50 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 border-b-0">
          Asset Register
        </h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">
          Comprehensive fixed asset management and financial reporting for unit{" "}
          {unitType}.
        </p>
      </div>

      <ResponsiveTabs
        setActiveTab={setActiveTab}
        tabNames={tabNames}
        activeTab={activeTab}
      />

      <div className="p-6 min-h-[600px]">
        {activeTab === "Dashboard" && (
          <AssetDashboardPage unitType={unitType} />
        )}
        {activeTab === "Assets Categories" && (
          <AssetCategoryPage unitType={unitType} />
        )}
        {activeTab === "Assets" && <AssetListPage unitType={unitType} />}
        {activeTab === "Reports" && <AssetReportsPage unitType={unitType} />}
        {activeTab === "Period Close" && (
          <AssetPeriodClosePage unitType={unitType} />
        )}
      </div>
    </div>
  );
};

export default AssetPage;

// export default function AssetRegisterApp() {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <BrowserRouter>
//         <AssetPage />
//       </BrowserRouter>
//     </QueryClientProvider>
//   );
// }
