import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UUID } from "./types";
import { financeApi } from "../../services/api";

// Accounts
export function useAccounts(unitId?: UUID) {
  return useQuery({
    queryKey: unitId ? qk.accounts(unitId) : ["finance", "accounts", "none"],
    queryFn: () => financeApi.listAccounts(unitId as UUID),
    enabled: !!unitId,
  });
}

export function useAllAccounts(type?: string) {
  return useQuery({
    queryKey: ["finance", "accounts", "all"],
    queryFn: () => financeApi.listAllAccounts(type as string),
    enabled: !!type,
  });
}

export function useCreateAccount(unitId: UUID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: financeApi.createAccount,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.accounts(unitId) }),
  });
}
export function useUpdateAccount(unitId: UUID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: UUID; payload: any }) =>
      financeApi.updateAccount(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.accounts(unitId) }),
  });
}

export function useSaveJournal(unitId: UUID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => financeApi.saveJournal(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.journals(unitId) }),
  });
}

export function useUpdateJournal(unitId: UUID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: UUID; payload: any }) =>
      financeApi.updateJournal(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: qk.journals(unitId) });
      qc.invalidateQueries({ queryKey: qk.journal(id) });
    },
  });
}

export const qk = {
  units: ["finance", "units"] as const,
  periods: (unitId: UUID) => ["finance", "periods", unitId] as const,
  accounts: (unitId: UUID) => ["finance", "accounts", unitId] as const,
  journals: (unitId: UUID, period?: string, status?: string, type?: string) =>
    [
      "finance",
      "journals",
      unitId,
      period ?? "",
      status ?? "",
      type ?? "",
    ] as const,
  journal: (id: UUID) => ["finance", "journal", id] as const,
};

// ----- Units -----
export function useUnits() {
  return useQuery({ queryKey: qk.units, queryFn: financeApi.listUnits });
}

export function useCreateUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: financeApi.createUnit,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.units }),
  });
}

export function useUpdateUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: UUID; payload: any }) =>
      financeApi.updateUnit(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.units }),
  });
}

// ----- Periods -----
export function usePeriods(unitId?: UUID) {
  return useQuery({
    queryKey: unitId ? qk.periods(unitId) : ["finance", "periods", "none"],
    queryFn: () => financeApi.listPeriods(unitId as UUID),
    enabled: !!unitId,
  });
}

export function useOpenPeriod(unitId: UUID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (period: string) => financeApi.openPeriod(unitId, period),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.periods(unitId) }),
  });
}

export function useClosePeriod(unitId: UUID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (period: string) => financeApi.closePeriod(unitId, period),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.periods(unitId) }),
  });
}

// ----- Journals -----
export function useJournals(params?: {
  unitId?: UUID;
  period?: string;
  status?: string;
  type?: string;
}) {
  const unitId = params?.unitId;
  return useQuery({
    queryKey: unitId
      ? qk.journals(unitId, params?.period, params?.status, params?.type)
      : ["finance", "journals", "none"],
    queryFn: () => financeApi.listJournals(params as any),
    enabled: !!unitId,
  });
}

export function useJournal(id?: UUID) {
  return useQuery({
    queryKey: id ? qk.journal(id) : ["finance", "journal", "none"],
    queryFn: () => financeApi.getJournal(id as UUID),
    enabled: !!id,
  });
}

export function useSubmitJournal(
  unitId: UUID,
  period?: string,
  status?: string,
  type?: string
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: UUID) => financeApi.submitJournal(id),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: qk.journals(unitId, period, status, type),
      }),
  });
}

export function useApproveJournal(
  unitId: UUID,
  period?: string,
  status?: string,
  type?: string
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: UUID) => financeApi.approveJournal(id),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: qk.journals(unitId, period, status, type),
      }),
  });
}

export function usePostJournal(
  unitId: UUID,
  period?: string,
  status?: string,
  type?: string
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: UUID) => financeApi.postJournal(id),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: qk.journals(unitId, period, status, type),
      }),
  });
}
