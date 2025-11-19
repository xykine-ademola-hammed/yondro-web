import React, { useEffect, useMemo, useState } from "react";
import { FaCheck } from "react-icons/fa";
import ModalWrapper from "../../components/modal-wrapper";
import { useOrganization } from "../../GlobalContexts/Organization-Context";
import type { Department, Unit } from "../../common/types";

// --- Helper (your provided formula) ---
type FinanceNode = { financeCode?: string };
type UserShape = {
  unit?: FinanceNode | null;
  department?: FinanceNode | null;
  schoolOrOffice?: FinanceNode | null;
} | null;

export function getFinanceCode(user: UserShape): string | undefined {
  return (
    user?.unit?.financeCode ||
    user?.department?.financeCode ||
    user?.schoolOrOffice?.financeCode
  );
}

interface FinancialCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (code: string) => void; // returns only the generated code
  selectedCode: string | null;
}

const FinancialCodeModal: React.FC<FinancialCodeModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedCode,
}) => {
  const { schoolOffices } = useOrganization(); // expects shape: { rows: [{ id, name, financeCode?, departments?, positions? }] }

  // Local selection state
  const [schoolOrOfficeId, setSchoolOrOfficeId] = useState<number | "">("");
  const [departmentId, setDepartmentId] = useState<number | "">("");
  const [unitId, setUnitId] = useState<number | "">("");

  // Derived lists based on selection
  const [departments, setDepartments] = useState<Department[] | undefined>(
    undefined
  );
  const [units, setUnits] = useState<Unit[]>([]);

  // Validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // When modal opens, initialize from selectedCode if needed (optional)
  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
    // Keep selections empty; selectedCode is display-only context, not preselect
    setSchoolOrOfficeId("");
    setDepartmentId("");
    setUnitId("");
    setDepartments(undefined);
    setUnits([]);
  }, [isOpen]);

  // Update departments when school/office changes
  useEffect(() => {
    if (!schoolOrOfficeId) {
      setDepartments(undefined);
      setDepartmentId("");
      setUnits([]);
      setUnitId("");
      return;
    }

    const selectedSchool = schoolOffices?.rows?.find(
      (o: any) => Number(o.id) === Number(schoolOrOfficeId)
    );

    const depts: Department[] | undefined = selectedSchool?.departments;
    setDepartments(depts);
    // Also, if school has positions-attached finance code logic, we ignore (not needed here)
    // Reset downstream selections
    setDepartmentId("");
    setUnits([]);
    setUnitId("");
  }, [schoolOrOfficeId, schoolOffices?.rows]);

  // Update units when department changes
  useEffect(() => {
    if (!departmentId || !departments) {
      setUnits([]);
      setUnitId("");
      return;
    }
    const dept = departments.find((d) => Number(d.id) === Number(departmentId));
    const us: Unit[] = dept?.units ?? [];
    setUnits(us);
    setUnitId("");
  }, [departmentId, departments]);

  // Resolve currently selected entities (with financeCode if present)
  const selectedSchoolObj = useMemo(() => {
    return (
      schoolOffices?.rows?.find(
        (o: any) => Number(o.id) === Number(schoolOrOfficeId)
      ) || null
    );
  }, [schoolOrOfficeId, schoolOffices?.rows]);

  const selectedDeptObj = useMemo(() => {
    if (!departments || !departmentId) return null;
    return (
      departments.find((d) => Number(d.id) === Number(departmentId)) || null
    );
  }, [departments, departmentId]);

  const selectedUnitObj = useMemo(() => {
    if (!units || !unitId) return null;
    return units.find((u) => Number(u.id) === Number(unitId)) || null;
  }, [units, unitId]);

  // Compute finance code via provided formula
  const generatedCode = useMemo(() => {
    const userShape: UserShape = {
      unit: selectedUnitObj
        ? { financeCode: (selectedUnitObj as any).financeCode }
        : null,
      department: selectedDeptObj
        ? { financeCode: (selectedDeptObj as any).financeCode }
        : null,
      schoolOrOffice: selectedSchoolObj
        ? { financeCode: (selectedSchoolObj as any).financeCode }
        : null,
    };
    return getFinanceCode(userShape) ?? "";
  }, [selectedUnitObj, selectedDeptObj, selectedSchoolObj]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [k: string]: string } = {};

    if (!schoolOrOfficeId)
      newErrors.schoolOrOfficeId = "School/Office is required";
    // Department is optional if School has financeCode and no departments/units selected;
    // but if departments exist under the selected school, require department.
    const schoolHasDepartments =
      Array.isArray(departments) && departments.length > 0;
    if (schoolHasDepartments && !departmentId) {
      newErrors.departmentId = "Department is required";
    }
    // If department has units, require unit; else optional
    const deptHasUnits = Array.isArray(units) && units.length > 0;
    if (deptHasUnits && !unitId) {
      newErrors.unitId = "Unit is required";
    }

    if (!generatedCode) {
      newErrors.generatedCode =
        "No financial code available for the current selection";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    onSelect(generatedCode);
    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={() => {
        setErrors({});
        onClose();
      }}
      title="Generate Financial Code"
    >
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg mb-6">
          <div className="mt-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* School / Office */}
              <div>
                <label
                  htmlFor="schoolOrOfficeId"
                  className="block text-sm font-medium text-gray-700"
                >
                  School | Office <span className="text-red-500">*</span>
                </label>
                <select
                  id="schoolOrOfficeId"
                  name="schoolOrOfficeId"
                  value={schoolOrOfficeId}
                  onChange={(e) =>
                    setSchoolOrOfficeId(
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                  className={`mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.schoolOrOfficeId ? "border-red-300" : ""
                  }`}
                >
                  <option value="">Select School or Office</option>
                  {schoolOffices?.rows?.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {errors.schoolOrOfficeId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.schoolOrOfficeId}
                  </p>
                )}
              </div>

              {/* Department (conditionally required if present under school) */}
              <div>
                <label
                  htmlFor="departmentId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Department{" "}
                  {Array.isArray(departments) && departments.length > 0 && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <select
                  id="departmentId"
                  name="departmentId"
                  value={departmentId}
                  onChange={(e) =>
                    setDepartmentId(
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                  disabled={!departments || departments.length === 0}
                  className={`mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.departmentId ? "border-red-300" : ""
                  }`}
                >
                  <option value="">Select Department</option>
                  {departments?.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                {errors.departmentId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.departmentId}
                  </p>
                )}
              </div>

              {/* Unit (conditionally required if present under department) */}
              <div>
                <label
                  htmlFor="unitId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Unit{" "}
                  {Array.isArray(units) && units.length > 0 && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <select
                  id="unitId"
                  name="unitId"
                  value={unitId}
                  onChange={(e) =>
                    setUnitId(e.target.value ? Number(e.target.value) : "")
                  }
                  disabled={!units || units.length === 0}
                  className={`mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.unitId ? "border-red-300" : ""
                  }`}
                >
                  <option value="">Select Unit</option>
                  {units?.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
                {errors.unitId && (
                  <p className="mt-1 text-sm text-red-600">{errors.unitId}</p>
                )}
              </div>
            </div>

            {/* Generated Code (read-only) */}
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label
                  htmlFor="generatedCode"
                  className="block text-sm font-medium text-gray-700"
                >
                  Generated Financial Code
                </label>
                <input
                  id="generatedCode"
                  name="generatedCode"
                  value={generatedCode || ""}
                  readOnly
                  placeholder="Select School/Office → Department → Unit to generate"
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    errors.generatedCode ? "border-red-300" : ""
                  }`}
                />
                {errors.generatedCode && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.generatedCode}
                  </p>
                )}
                {!!selectedCode && (
                  <p className="mt-1 text-xs text-gray-500">
                    Previously selected:{" "}
                    <span className="font-mono">{selectedCode}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setErrors({});
                onClose();
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
            >
              <FaCheck className="mr-2" />
              Use This Code
            </button>
          </div>
        </div>
      </form>
    </ModalWrapper>
  );
};

export default FinancialCodeModal;
