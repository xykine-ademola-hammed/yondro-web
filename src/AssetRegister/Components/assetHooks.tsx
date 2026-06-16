import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  UUID,
  Asset,
  AssetCategory,
  AssetListingRow,
  AssetStatus,
  AssetTransaction,
  DashboardSummary,
  PeriodReadiness,
  AssetValuationRow,
  DepSummaryRow,
  Paginated,
} from "./types";
import { assetApi } from "../../services/api";

// --------------------
// Query Keys
// --------------------
export const qk = {
  dashboard: (unitId: UUID) => ["assets", "dashboard", unitId] as const,
  categories: (unitId: UUID) => ["assets", "categories", unitId] as const,
  assets: (params: {
    unitType: string;
    search?: string;
    status?: string | "";
    categoryId?: string | "";
    location?: string;
    custodianEmployeeId?: string | "";
  }) => ["assets", "list", params] as const,
  asset: (id: UUID) => ["assets", "detail", id] as const,
  transactions: (assetId: UUID) => ["assets", "transactions", assetId] as const,
  periodReadiness: (unitId: UUID) => ["assets", "period-readiness", unitId] as const,
};

// --------------------
// Queries
// --------------------
export function useAssetDashboard(unitType: string) {
  return useQuery<DashboardSummary>({
    queryKey: qk.dashboard(unitType),
    queryFn: () => assetApi.getDashboard(unitType),
    enabled: !!unitType,
  });
}

export function useAssetCategories(unitType: string) {
  return useQuery<{ data: AssetCategory[] }>({
    queryKey: qk.categories(unitType),
    queryFn: () => assetApi.listCategories(unitType),
    enabled: !!unitType,
  });
}

export function useAssets(params: {
  unitType: string;
  search?: string;
  status?: AssetStatus | "";
  categoryId?: UUID | "";
  location?: string;
  custodianEmployeeId?: UUID | "";
}) {
  return useQuery<Paginated<AssetListingRow>>({
    queryKey: qk.assets(params),
    queryFn: () => assetApi.listAssets(params),
    enabled: !!params.unitType,
  });
}

export function useAsset(id: UUID) {
  return useQuery<{ data: Asset }>({
    queryKey: qk.asset(id),
    queryFn: () => assetApi.getAsset(id),
    enabled: !!id,
  });
}

export function useAssetTransactions(assetId: UUID) {
  return useQuery<{ data: AssetTransaction[] }>({
    queryKey: qk.transactions(assetId),
    queryFn: () => assetApi.listAssetTransactions(assetId),
    enabled: !!assetId,
  });
}

export function usePeriodReadiness(unitId: UUID) {
  return useQuery<PeriodReadiness>({
    queryKey: unitId
      ? qk.periodReadiness(unitId)
      : ["assets", "period-readiness", "none"],
    queryFn: () => assetApi.getPeriodsReadiness(unitId as UUID),
    enabled: !!unitId,
  });
}

export function useReportListing(unitId: UUID) {
  return useQuery<AssetListingRow[]>({
    queryKey: ["assets", "report", "listing", unitId],
    queryFn: () => assetApi.reportListing(unitId),
    enabled: !!unitId,
  });
}

export function useReportValuation(unitId: UUID) {
  return useQuery<AssetValuationRow[]>({
    queryKey: ["assets", "report", "valuation", unitId],
    queryFn: () => assetApi.reportValuation(unitId),
    enabled: !!unitId,
  });
}

export function useReportDepSummary(unitId: UUID, period: string) {
  return useQuery<DepSummaryRow[]>({
    queryKey: ["assets", "report", "dep-summary", unitId, period],
    queryFn: () => assetApi.reportDepSummary(unitId, period),
    enabled: !!unitId && !!period,
  });
}

// --------------------
// Mutations
// --------------------
export function useCreateAsset(unitId: UUID) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: assetApi.createAsset,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assets", "list"] });
      qc.invalidateQueries({ queryKey: qk.dashboard(unitId) });
    },
  });
}

export function useUpdateAsset(unitId: UUID) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: UUID; payload: Partial<Asset> }) =>
      assetApi.updateAsset(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["assets", "list"] });
      qc.invalidateQueries({ queryKey: qk.asset(id) });
      qc.invalidateQueries({ queryKey: qk.dashboard(unitId) });
    },
  });
}

export function useCapitalizeAsset(assetId: UUID) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => assetApi.capitalizeAsset(assetId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.asset(assetId) });
      qc.invalidateQueries({ queryKey: qk.transactions(assetId) });
    },
  });
}

export function useDisposeAsset(unitId: UUID) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ assetId, payload }: { assetId: UUID; payload: any }) =>
      assetApi.disposeAsset(assetId, payload),
    onSuccess: (_, { assetId }) => {
      qc.invalidateQueries({ queryKey: ["assets", "list"] });
      qc.invalidateQueries({ queryKey: qk.asset(assetId) });
      qc.invalidateQueries({ queryKey: qk.transactions(assetId) });
      qc.invalidateQueries({ queryKey: qk.dashboard(unitId) });
    },
  });
}

export function useRunDepreciation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: { period: string; transactionDate?: string, unitType: string }) =>
      assetApi.runDepreciation(payload),
    onSuccess: (_, { unitType }) => {
      qc.invalidateQueries({ queryKey: qk.dashboard(unitType) });
      qc.invalidateQueries({ queryKey: ["assets", "list"] });
      qc.invalidateQueries({ queryKey: qk.periodReadiness(unitType) });
    },
  });
}

export function useCreateAssetCategory(unitId: UUID) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: assetApi.createCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.categories(unitId) });
    },
  });
}

export function useUpdateAssetCategory(unitId: UUID) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: UUID; payload: any }) =>
      assetApi.updateCategory(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.categories(unitId) });
    },
  });
}

export function useDeleteAssetCategory(unitId: UUID) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: UUID) => assetApi.deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.categories(unitId) });
    },
  });
}
