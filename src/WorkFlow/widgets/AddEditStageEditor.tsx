import { useEffect, useState } from "react";
import type { ApiFilter, Position } from "../../common/types";
import { useOrganization } from "../../GlobalContexts/Organization-Context";
import { genericPositions } from "../../common/constant";
import { useMutation } from "@tanstack/react-query";
import { getMutationMethod } from "../../common/api-methods";
import useForm from "../../common/useForms";
import type { FormProps } from "../../common/useForms";

interface AddEditStageEditorProps {
  selectedStage: WorkFlowStage;
  setIsOpenStageModal: (isOpen: boolean) => void;
  onSubmit: (stageIndex: number, stageData: WorkFlowStage) => void;
  selectedStageIndex: number;
  formId: string;
}

export interface WorkFlowStage {
  id?: number | undefined;
  name: string;
  instruction: string;
  isSubStage: boolean;
  isRequestor: boolean;
  isRequestorDepartment: boolean;
  assigneeDepartmentId?: string;
  assigneePositionId?: string;
  assigineeLookupField: string;
  isRequireApproval: boolean;
  formFields: any[];
  formSections: any[];
  organizationId?: number | string;
  departmentId?: number | string;
  step?: number;
  parentStageId?: number;
}

export const emptyStageData: WorkFlowStage = {
  id: undefined,
  name: "",
  instruction: "",
  isSubStage: false,
  isRequestor: false,
  isRequestorDepartment: false,
  assigneeDepartmentId: undefined,
  assigneePositionId: undefined,
  assigineeLookupField: "",
  isRequireApproval: false,
  formFields: [],
  formSections: [],
};

export default function AddEditStageEditor({
  selectedStage,
  setIsOpenStageModal,
  onSubmit,
  selectedStageIndex,
  formId,
}: AddEditStageEditorProps) {
  const { departments } = useOrganization();
  const [positions, setPositions] = useState<Position[]>();
  const [formData, setStageData] = useState<WorkFlowStage>(selectedStage);
  const [selectedForm, setSelectedForm] = useState<FormProps>({} as FormProps);

  const { getFormById } = useForm();

  const { mutateAsync: fetchDepartmentPositions } = useMutation({
    mutationFn: (body: ApiFilter) =>
      getMutationMethod("POST", `api/positions/get-positions`, body, true),
    onSuccess: (data) => {
      setPositions(data.rows);
    },
    onError: (error) => {
      console.error("Failed to fetch positions:", error);
    },
  });

  useEffect(() => {
    if (formData.assigneeDepartmentId) {
      fetchDepartmentPositions({
        filters: [
          {
            key: "departmentId",
            value: formData.assigneeDepartmentId || "",
            condition: "equal",
          },
        ],
        limit: 1000,
        offset: 0,
      });
    }
  }, [formData.assigneeDepartmentId]);

  useEffect(() => {
    if (formId) {
      setSelectedForm(getFormById(Number(formId)));
    }
  }, [formId]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    console.log("----name, value-----", name, value);
    if (name === "assigneeDepartmentId") {
      setStageData((prev) => ({
        ...prev,
        assigneeDepartmentId: Number(value),
        assigneePositionId: undefined,
        assigineeLookupField: undefined,
      }));
    } else {
      setStageData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSaveStage = () => {
    console.log("----formData to submit-----", formData);
    // return;
    onSubmit(selectedStageIndex, formData);
    setIsOpenStageModal(false);
    setStageData({ ...emptyStageData });
  };

  return (
    <div className="">
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {selectedStage?.id ? "Edit" : "Create"} Stage
              </h1>
              <p className="text-gray-600">Modify form stage and settings.</p>
            </div>
          </div>

          <div className="mb-8 pb-6 border-gray-200">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stage Title
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instruction
                </label>
                <textarea
                  id="instruction"
                  name="instruction"
                  value={formData.instruction}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div className="mt-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isSubStage}
                    onChange={(e) =>
                      setStageData((prev) => ({
                        ...prev,
                        isSubStage: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Sub Stage</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignee
                </label>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="isRequestor"
                    checked={formData.isRequestor}
                    onChange={(e) =>
                      setStageData((prev) => ({
                        ...prev,
                        isRequestor: e.target.checked,
                      }))
                    }
                    className="mr-2"
                  />
                  <label
                    htmlFor="assignToRequestor"
                    className="text-sm text-gray-700"
                  >
                    Requestor
                  </label>
                </div>

                {!formData.isRequestor && (
                  <div className="border border-gray-300 p-4 rounded-lg bg-white">
                    {/* Assignee Selection Row */}
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Department Selection */}
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            id="isRequestorDepartment"
                            checked={formData.isRequestorDepartment}
                            onChange={(e) => {
                              setStageData((prev) => ({
                                ...prev,
                                isRequestorDepartment: e.target.checked,
                                assigneeDepartmentId: undefined,
                                assigneePositionId: undefined,
                                assigineeLookupField: undefined,
                              }));
                            }}
                            className="mr-2"
                          />
                          <label
                            htmlFor="isRequestorDepartment"
                            className="text-sm text-gray-700"
                          >
                            Requestor Department
                          </label>
                        </div>
                        {formData.isRequestorDepartment ? (
                          <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm">
                            Requestor Department
                          </div>
                        ) : (
                          <select
                            id="assigneeDepartmentId"
                            name="assigneeDepartmentId"
                            value={formData.assigneeDepartmentId}
                            onChange={handleInputChange}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                          >
                            <option value="">Select Department</option>
                            {departments.rows.map((department) => (
                              <option key={department.id} value={department.id}>
                                {department.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Position Selection */}
                      <div className="flex-1">
                        <label className="block text-gray-700 text-sm mb-2">
                          Search position
                        </label>
                        {formData.isRequestorDepartment ? (
                          <select
                            id="assigneePositionId"
                            name="assigneePositionId"
                            value={formData.assigneePositionId}
                            onChange={handleInputChange}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                          >
                            <option value="">Select Position</option>
                            {genericPositions.map((position) => (
                              <option key={position.id} value={position.id}>
                                {position.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <select
                            id="assigneePositionId"
                            name="assigneePositionId"
                            value={formData.assigneePositionId}
                            onChange={handleInputChange}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                          >
                            <option value="">Select Position</option>
                            {positions?.map((position) => (
                              <option key={position.id} value={position.id}>
                                {position.title}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Assignee Holder Selection */}
                      <div className="flex-1">
                        <label className="block text-gray-700 text-sm mb-2">
                          Select assignee lookup field
                        </label>
                        <select
                          name="assigineeLookupField"
                          id="assigineeLookupField"
                          value={formData?.assigineeLookupField}
                          onChange={(e) =>
                            setStageData((prev) => ({
                              ...prev,
                              assigineeLookupField: e.target.value,
                            }))
                          }
                          required
                          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                          <option value="">Select an option</option>
                          {selectedForm?.assigneeHolders &&
                            Object.entries(selectedForm.assigneeHolders).map(
                              ([key, value]) => (
                                <option key={key} value={key}>
                                  {value}
                                </option>
                              )
                            )}
                        </select>
                      </div>
                    </div>

                    {/* Approval Requirement */}
                    <div className="mt-5 flex items-center">
                      <input
                        type="checkbox"
                        id="isRequireApproval"
                        checked={formData.isRequireApproval}
                        onChange={(e) =>
                          setStageData((prev) => ({
                            ...prev,
                            isRequireApproval: e.target.checked,
                          }))
                        }
                        className="mr-2"
                      />
                      <label
                        htmlFor="isRequireApproval"
                        className="text-sm text-gray-700"
                      >
                        Require approval
                      </label>
                      <span className="ml-4 text-yellow-500 text-xs">
                        This will add approve, reject and comment
                        functionalities.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <h3 className="text-l font-semibold text-gray-900">
                  Vissible sections
                </h3>
                <div className="w-full">
                  <select
                    multiple
                    value={formData.formSections || []}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions).map(
                        (option) => option.value
                      );
                      setStageData({
                        ...formData,
                        formSections: selected,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm pr-8"
                    style={{ minHeight: "100px" }}
                  >
                    {selectedForm?.formSections &&
                      Object.entries(selectedForm.formSections).map(
                        ([key, value]) => (
                          <option key={key} value={key}>
                            {value}
                          </option>
                        )
                      )}
                  </select>
                  <div className="mt-2 text-xs text-gray-500">
                    Hold Ctrl (Windows) or Cmd (Mac) to select multiple fields.
                  </div>
                </div>

                {formData?.formSections &&
                  formData?.formSections.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData?.formSections?.map((labelKey: string) => (
                        <span
                          key={labelKey}
                          className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                        >
                          {selectedForm?.formSections?.[labelKey] || labelKey}
                        </span>
                      ))}
                    </div>
                  )}
              </div>

              <div className="mt-6">
                <h3 className="text-l font-semibold text-gray-900">
                  Form fields
                </h3>
                <select
                  multiple
                  value={formData.formFields || []}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions).map(
                      (option) => option.value
                    );
                    setStageData({
                      ...formData,
                      formFields: selected,
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm pr-8"
                  style={{ minHeight: "100px" }}
                >
                  {selectedForm?.inputLabels &&
                    Object.entries(selectedForm.inputLabels).map(
                      ([key, value]) => (
                        <option key={key} value={key}>
                          {value}
                        </option>
                      )
                    )}
                </select>
                <div className="mt-2 text-xs text-gray-500">
                  Hold Ctrl (Windows) or Cmd (Mac) to select multiple fields.
                </div>

                {formData.formFields && formData.formFields.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.formFields.map((labelKey: string) => (
                      <span
                        key={labelKey}
                        className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                      >
                        {selectedForm?.inputLabels?.[labelKey] || labelKey}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end mt-6">
          <div onClick={() => setIsOpenStageModal(false)} className="">
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium whitespace-nowrap cursor-pointer">
              Cancel
            </button>
          </div>
          <div className="ml-4">
            <button
              onClick={handleSaveStage}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium whitespace-nowrap cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
