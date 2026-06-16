import React from "react";
import { Link } from "react-router-dom";
import { useAssetDashboard } from "./Components/assetHooks";
import { Card, Button } from "./Components/primitive";
import { formatMoney } from "./Components/utils";
import PeriodReadinessPanel from "./PeriodReadinessPanel";

interface AssetDashboardPageProps {
  unitType: string;
}

const AssetDashboardPage: React.FC<AssetDashboardPageProps> = ({ unitType }) => {
  const { data, isLoading, error } = useAssetDashboard(unitType);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Asset Register Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            At-a-glance summary and month-end readiness.
          </p>
        </div>
        <Link to={`/asset-register?unitType=${unitType}`}>
          <Button variant="primary">Go to Asset List</Button>
        </Link>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-slate-500 animate-pulse">
          <div className="h-4 w-4 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin" />
          Loading dashboard data…
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <p className="font-semibold">Error loading dashboard</p>
          <p className="mt-1">{String((error as any)?.message || error)}</p>
        </div>
      )}

      {data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card title="Total Assets" value={data.totalCount} />
          <Card title="Total Cost" value={formatMoney(data.totalCost)} />
          <Card
            title="Accum. Depreciation"
            value={formatMoney(data.totalAccumDep)}
          />
          <Card title="Net Book Value" value={formatMoney(data.totalNBV)} />
          <Card
            title="Due for Depreciation"
            value={data.dueForDepreciationCount}
            subtitle="This period"
          />
          <Card
            title="Near End of Life"
            value={data.nearEndOfLifeCount}
            subtitle="Review upcoming replacements"
          />
          <Card
            title="Disposed This Year"
            value={data.disposedThisYearCount}
            subtitle="Audit trail available"
          />
        </div>
      )}

      <PeriodReadinessPanel unitType={unitType} />
    </div>
  );
};

export default AssetDashboardPage;
