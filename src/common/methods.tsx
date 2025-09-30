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

export const isFile = (v: any): v is File | Blob =>
  (typeof File !== "undefined" && v instanceof File) ||
  (typeof Blob !== "undefined" && v instanceof Blob);

// Helper: checks for any file(s) in formResponses object
export function containsFiles(obj: any): boolean {
  if (!obj || typeof obj !== "object") return false;
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
    const value = obj[key];
    if (isFile(value)) return true;
    if (Array.isArray(value) && value.some(isFile)) return true;
    // If nested object, do a recursive check
    if (
      value &&
      typeof value === "object" &&
      !(value instanceof Date) &&
      !Array.isArray(value)
    ) {
      if (containsFiles(value)) return true;
    }
  }
  return false;
}

/**
 * Recursively appends all fields to FormData, correctly handling fields
 * with files, including ones like { file: File } or array of such
 */
export function appendFormData(
  formData: FormData,
  data: any,
  parentKey = "",
  updateFileName = true
) {
  Object.entries(data || {}).forEach(([key, value]) => {
    const formKey = parentKey ? `${parentKey}[${key}]` : key;

    if (isFile(value)) {
      if (updateFileName) {
        const timestamp = Date.now();
        const newFileName = `${timestamp}_${formKey}`;
        const renamedFile = new File([value], newFileName, {
          type: value.type,
        });
        formData.append(formKey, renamedFile);
      }
    } else if (
      value &&
      typeof value === "object" &&
      "file" in value &&
      isFile(value.file)
    ) {
      if (updateFileName) {
        const timestamp = Date.now();
        const newFileName = `${timestamp}_${formKey}`;
        const renamedFile = new File([value.file], newFileName, {
          type: value.file.type,
        });
        formData.append(formKey, renamedFile);
        return;
      }
      // If field is e.g. {file: File, ...}, append the file
      formData.append(formKey, value.file);
    } else if (Array.isArray(value)) {
      value.forEach((v, idx) => {
        if (isFile(v)) {
          formData.append(`${formKey}[${idx}]`, v);
        } else if (
          v &&
          typeof v === "object" &&
          "file" in v &&
          isFile(v.file)
        ) {
          formData.append(`${formKey}[${idx}]`, v.file);
        } else if (typeof v === "object") {
          appendFormData(formData, v, `${formKey}[${idx}]`);
        } else {
          formData.append(`${formKey}[${idx}]`, String(v));
        }
      });
    } else if (
      value &&
      typeof value === "object" &&
      !(value instanceof Date) &&
      !Array.isArray(value)
    ) {
      // Only append non-empty objects
      if (Object.keys(value).length > 0) {
        appendFormData(formData, value, formKey);
      }
    } else if (value !== undefined && value !== null) {
      formData.append(formKey, String(value));
    }
  });
}
