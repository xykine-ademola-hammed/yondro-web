export type UUID = string;

export type UnitStatus = "ACTIVE" | "INACTIVE";
export interface FinancialUnit {
  id: string;
  code: string;
  name: string;
  currency: string;
  status: UnitStatus;
}

export interface CreateUnitPayload {
  code: string;
  name: string;
  unitType: UnitType;
  currency: string;
  status: UnitStatus;
}

export type PeriodStatus = "OPEN" | "CLOSED";
export interface FinancialPeriod {
  id: string;
  unitId: string;
  period: string; // YYYY-MM
  status: PeriodStatus;
  closed_at?: string | null;
}

export type UnitType =
  | "STORE"
  | "SALARY"
  | "LOAN_ADVANCE"
  | "EXPENDITURE"
  | "REVENUE"
  | "OTHER";

export type AccountType =
  | "ASSET"
  | "LIABILITY"
  | "EQUITY"
  | "INCOME"
  | "EXPENSE";
export type NormalBalance = "DEBIT" | "CREDIT";
export interface GLAccount {
  id: string;
  unitId: string;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  normalBalance: NormalBalance;
  isCash: boolean;
  parent_account_id?: string | null;
  status: "ACTIVE" | "INACTIVE";
}

export type JournalType =
  | "REVENUE"
  | "EXPENDITURE"
  | "SALARY"
  | "STORE"
  | "LOAN_ADVANCE"
  | "OTHER";
export type JournalStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "POSTED"
  | "REVERSED";

export interface JournalHeader {
  id: string;
  unitId: string;
  journalType: JournalType;
  journalNo: string;
  transactionDate: string; // YYYY-MM-DD
  period: string; // YYYY-MM
  reference_no?: string | null;
  description?: string | null;
  status: JournalStatus;
  totalDebit: number;
  totalCredit: number;
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: string;
  journal_id: string;
  account_id: string;
  description?: string | null;
  debit: number;
  credit: number;
}

export interface Journal {
  header: JournalHeader;
  entries: JournalEntry[];
}

export interface CreateJournalPayload {
  unitId: string;
  journalType: JournalType;
  transactionDate: string; // YYYY-MM-DD
  period: string; // YYYY-MM
  reference_no?: string | null;
  description?: string | null;
  entries: {
    account_id: string;
    description?: string | null;
    debit: number;
    credit: number;
  }[];
}

export interface UpdateJournalPayload {
  journalType?: JournalType;
  transactionDate?: string; // YYYY-MM-DD
  period?: string; // YYYY-MM
  reference_no?: string | null;
  description?: string | null;
  entries?: {
    id?: string; // If present, update existing entry. If not, create new entry.
    account_id: string;
    description?: string | null;
    debit: number;
    credit: number;
  }[];
}

export interface Report {
  id: string;
  unitId: string;
  period: string; // YYYY-MM
  type: string;
  name: string;
  generated_at: string;
}
