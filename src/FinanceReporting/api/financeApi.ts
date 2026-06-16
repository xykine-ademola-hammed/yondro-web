// import { api, apiBlob } from "./http";
// import type {
//   FinancialUnit,
//   FinancialPeriod,
//   GLAccount,
//   JournalHeader,
//   UUID,
// } from "./types";

// // ---- Units ----
// export const financeApi = {
//   listUnits: () => api<FinancialUnit[]>("/finance/units"),
//   createUnit: (payload: Partial<FinancialUnit>) =>
//     api<FinancialUnit>("finance/units", {
//       method: "POST",
//       body: JSON.stringify(payload),
//     }),
//   updateUnit: (id: UUID, payload: Partial<FinancialUnit>) =>
//     api<FinancialUnit>(`finance/units/${id}`, {
//       method: "PATCH",
//       body: JSON.stringify(payload),
//     }),

//   // ---- Periods ----
//   listPeriods: (unitId: UUID) =>
//     api<FinancialPeriod[]>("finance/periods", { query: { unitId } }),
//   openPeriod: (unitId: UUID, period: string) =>
//     api<FinancialPeriod>("finance/periods/open", {
//       method: "POST",
//       body: JSON.stringify({ unitId, period }),
//     }),
//   closePeriod: (unitId: UUID, period: string) =>
//     api<FinancialPeriod>("finance/periods/close", {
//       method: "POST",
//       body: JSON.stringify({ unitId, period }),
//     }),

//   // ---- Accounts ----
//   listAccounts: (unitId: UUID) =>
//     api<GLAccount[]>("finance/accounts", { query: { unitId } }),
//   createAccount: (payload: Partial<GLAccount>) =>
//     api<GLAccount>("finance/accounts", {
//       method: "POST",
//       body: JSON.stringify(payload),
//     }),
//   updateAccount: (id: UUID, payload: Partial<GLAccount>) =>
//     api<GLAccount>(`finance/accounts/${id}`, {
//       method: "PATCH",
//       body: JSON.stringify(payload),
//     }),

//   // ---- Journals ----
//   listJournals: (params: {
//     unitId: UUID;
//     period?: string;
//     status?: string;
//     type?: string;
//   }) => api<JournalHeader[]>("finance/journals", { query: params }),
//   getJournal: (id: UUID) => api<any>(`finance/journals/${id}`),
//   saveJournal: (payload: any) =>
//     api<any>("finance/journals", {
//       method: "POST",
//       body: JSON.stringify(payload),
//     }),
//   updateJournal: (id: UUID, payload: any) =>
//     api<any>(`finance/journals/${id}`, {
//       method: "PATCH",
//       body: JSON.stringify(payload),
//     }),

//   submitJournal: (id: UUID) =>
//     api(`finance/journals/${id}/submit`, { method: "POST" }),
//   approveJournal: (id: UUID) =>
//     api(`finance/journals/${id}/approve`, { method: "POST" }),
//   postJournal: (id: UUID) =>
//     api(`/finance/journals/${id}/post`, { method: "POST" }),

//   // ---- PDFs ----
//   downloadVoucherPdf: (journalId: UUID) =>
//     apiBlob(`finance/journals/${journalId}/voucher.pdf`),

//   downloadReportPdf: (params: {
//     unitId: UUID;
//     period: string;
//     reportType: string;
//     accountId?: UUID;
//   }) => apiBlob(`finance/reports/${params.reportType}.pdf`, { query: params }),
// };
