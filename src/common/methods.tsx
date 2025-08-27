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
    label: employee?.position?.title ?? "",
    value: employee?.position?.id,
  }));
};

import _ from "lodash";

/**
 * Removes all keys from an object whose value is undefined or "" (empty string).
 * Does not mutate the original object.
 *
 * @param obj The object to clean
 * @returns A new object without empty string or undefined fields
 */
export function cleanEmptyFields<T extends Record<string, any>>(
  obj: T
): Partial<T> {
  return _.omitBy(obj, (v) => v === undefined || v === "" || v === 0);
}

export function getFinanceCode(user) {
  return (
    user?.unit?.financeCode ||
    user?.department?.financeCode ||
    user?.schoolOrOffice?.financeCode
  );
}

export function generateVoucherCode(): string {
  // Example: VCH-20240609-AB2CD3F
  const datePart = new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, "")
    .slice(0, 14); // e.g., 20240609T124530
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6 random alphanumeric chars
  return `VCH-${datePart}-${randomPart}`;
}
