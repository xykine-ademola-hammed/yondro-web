export type UUID = string;

export type AssetStatus =
  | "DRAFT"
  | "CAPITALIZED"
  | "IN_SERVICE"
  | "DISPOSED"
  | "IMPAIRED";

export type DepMethod = "SL" | "RB";
export type ResidualPolicy = "NONE" | "FIXED" | "PERCENT";

export type Asset = {
  id: UUID;
  unitId: UUID;
  categoryId: UUID;
  assetTag: string;
  name: string;
  description: string | null;

  acquisitionDate: string | null;
  capitalizationDate: string | null;
  inServiceDate: string | null;

  cost: number;
  residualValue: number;
  accumulatedDepreciation: number;

  depMethod: DepMethod | null;
  usefulLifeMonths: number | null;
  depRateAnnual: number | null;

  location: string | null;
  custodianEmployeeId: UUID | null;

  status: AssetStatus;

  disposedAt: string | null;
  disposalProceeds: number | null;
  disposalNotes: string | null;

  createdAt: string;
  updatedAt: string;
};

export type AssetCategory = {
  id: UUID;
  unitId: UUID;
  code: string;
  name: string;

  assetAccountId: UUID;
  accumDepAccountId: UUID;
  depExpAccountId: UUID;

  depMethod: DepMethod;
  usefulLifeMonths: number | null;
  depRateAnnual: number | null;

  isDepreciable: boolean;
  residualValuePolicy: ResidualPolicy;
  residualValueAmount: number | null;
  residualValuePercent: number | null;
  status: "ACTIVE" | "INACTIVE";
};

export type AssetTxnType =
  | "ACQ"
  | "CAP"
  | "DEP"
  | "DISP"
  | "IMPAIR"
  | "ADJUST"
  | "REVERSAL";

export type AssetTransaction = {
  id: UUID;
  unitId: UUID;
  assetId: UUID;
  txnType: AssetTxnType;
  txnDate: string; // YYYY-MM-DD
  period: string; // YYYY-MM
  amount: number;
  journalHeaderId: UUID | null;
  notes: string | null;
  createdAt: string;
};

export type DashboardSummary = {
  totalCount: number;
  totalCost: number;
  totalAccumDep: number;
  totalNBV: number;
  dueForDepreciationCount: number;
  nearEndOfLifeCount: number;
  disposedThisYearCount: number;
};

export type PeriodReadiness = {
  period: string; // YYYY-MM
  status: "OPEN" | "CLOSED";
  unpostedJournalCount: number;
  depreciation: {
    status: "MISSING" | "DRAFT" | "POSTED";
    totalAmount?: number;
  };
  trialBalance: { balanced: boolean };
};

export type Paginated<T> = {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  rows: T[];
  success: boolean;
  error?: string;
};

export type AssetListingRow = {
  id: UUID;
  assetTag: string;
  name: string;
  categoryName: string;
  location: string | null;
  custodianEmployeeId: UUID | null;
  acquisitionDate: string | null;
  inServiceDate: string | null;
  cost: number;
  accumulatedDepreciation: number;
  netBookValue: number;
  status: AssetStatus;
  createdAt: string;
  category: AssetCategory;
};

export type AssetValuationRow = {
  categoryId: UUID;
  categoryName: string;
  totalCost: number;
  totalAccumDep: number;
  totalNBV: number;
};

export type DepSummaryRow = {
  categoryName: string;
  depreciationAmount: number;
};
