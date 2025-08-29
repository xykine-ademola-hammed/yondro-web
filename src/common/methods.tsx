import type { User } from "../GlobalContexts/AuthContext";
import type { Employee, SelectOption } from "./types";
import _ from "lodash";

/**
 * Clears authentication token from localStorage.
 */
export function clearLocalStorage() {
  localStorage.removeItem("token");
}

/**
 * Extracts positions from a list of employees into SelectOption[].
 *
 * @param employees List of Employee
 */
export const extractPositions = (employees: Employee[]): SelectOption[] => {
  return employees
    .filter((employee) => !!employee.position?.id && !!employee.position?.title)
    .map((employee) => ({
      id: Number(employee.position!.id),
      label: employee.position!.title!,
      value: employee.position!.id!,
    }));
};

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
  return _.omitBy(obj, (v) => v === undefined || v === "") as Partial<T>;
}

/**
 * Safely retrieves the financeCode from a user object hierarchy.
 *
 * @param user The user object (can be an Employee or similar structure)
 * @returns The first non-empty financeCode value found, or undefined
 */
export function getFinanceCode(user: User | null): string | undefined {
  return (
    user?.unit?.financeCode ||
    user?.department?.financeCode ||
    user?.schoolOrOffice?.financeCode
  );
}

/**
 * Generates a voucher code in the format: VCH-YYYYMMDDHHMMSS-ABC123
 */
export function generateVoucherCode(): string {
  // Pattern: VCH-20240609T124530-AB2CD3F
  const datePart = new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, "")
    .slice(0, 14); // e.g., 20240609T124530
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6 random alphanumeric chars
  return `VCH-${datePart}-${randomPart}`;
}
