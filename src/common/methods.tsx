import type { Position } from "postcss";
import type { Employee, SelectOption } from "./types";

export function clearLocalStorage() {
  localStorage.removeItem("token");
}

export function removeObjectField(objectInput: any, fields: string[]) {
  return;
}

export const extractPositions = (employees: Employee[]): SelectOption[] => {
  return employees.map((employee) => ({
    id: Number(employee?.position?.id),
    label: employee?.position?.name ?? "",
    value: employee?.position?.id,
  }));
};
