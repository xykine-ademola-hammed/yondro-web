import { useEffect, useState } from "react";
import type {
  ApiFilter,
  FormField,
  Position,
  StageData,
} from "../../common/types";
import { useOrganization } from "../../GlobalContexts/Organization-Context";
import { genericPositions } from "../../common/constant";
import { useMutation } from "@tanstack/react-query";
import { getMutationMethod } from "../../common/api-methods";
import FieldRender from "../../components/FieldRender";

interface AddEditStageEditorProps {
  selectedStage: StageData;
  setIsOpenStageModal: (isOpen: boolean) => void;
  onSubmit: (stageIndex: number, stageData: StageData) => void;
  selectedStageIndex: number;
}

export const emptyStageData: StageData = {
  name: "",
  description: "",
  fields: [],
  assignToRequestor: false,
  assignToRequestorDepartment: false,
  isRequireApproval: false,
};

export default function AddEditStageEditor({
  selectedStage,
  setIsOpenStageModal,
  onSubmit,
  selectedStageIndex,
}: AddEditStageEditorProps) {
  const { departments } = useOrganization();
  const [positions, setPositions] = useState<Position[]>();
  const [formData, setStageData] = useState<StageData>(selectedStage);
  const [draggedField, setDraggedField] = useState<number | null>(null);

  const fieldTypes = [
    { type: "text", label: "Text Input", icon: "ri-text" },
    { type: "email", label: "Email", icon: "ri-mail-line" },
    { type: "number", label: "Number", icon: "ri-hashtag" },
    { type: "textarea", label: "Text Area", icon: "ri-file-text-line" },
    { type: "select", label: "Dropdown", icon: "ri-arrow-down-s-line" },
    { type: "radio", label: "Radio Button", icon: "ri-radio-button-line" },
    { type: "checkbox", label: "Checkbox", icon: "ri-checkbox-line" },
    { type: "date", label: "Date Picker", icon: "ri-calendar-line" },
    { type: "file", label: "File Upload", icon: "ri-upload-cloud-line" },
    { type: "stage", label: "Sub stage", icon: "ri-upload-cloud-line" },
  ];

  const addField = (type: FormField["type"]) => {
    const newField: FormField = {
      id: Number(Date.now()),
      type,
      label: `New ${type} field`,
      required: false,
      ...(type === "select" || type === "radio"
        ? { options: ["Option 1", "Option 2"] }
        : {}),
    };
    setStageData((prev) => ({ ...prev, fields: [...prev?.fields, newField] }));
  };

  const updateField = (
    fieldId: number | string,
    updates: Partial<FormField>
  ) => {
    setStageData((prev) => ({
      ...prev,
      fields: prev.fields.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      ),
    }));
  };

  const removeField = (fieldId: string | number) => {
    setStageData((prev) => ({
      ...prev,
      fields: prev?.fields?.filter((field) => field.id !== fieldId),
    }));
  };

  const moveField = (fromIndex: number, toIndex: number) => {
    const newFields = [...formData.fields];
    const [movedField] = newFields.splice(fromIndex, 1);
    newFields.splice(toIndex, 0, movedField);
    setStageData((prev) => ({ ...prev, fields: newFields }));
  };

  const handleDragStart = (index: number) => {
    setDraggedField(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedField !== null && draggedField !== dropIndex) {
      moveField(draggedField, dropIndex);
    }
    setDraggedField(null);
  };

  const addOption = (fieldId: number) => {
    const field = formData?.fields?.find((f) => f.id === fieldId);
    if (field && field.options) {
      updateField(fieldId, {
        options: [...field.options, `Option ${field.options.length + 1}`],
      });
    }
  };

  const updateOption = (
    fieldId: number,
    optionIndex: number,
    value: string
  ) => {
    const field = formData?.fields?.find((f) => f.id === fieldId);
    if (field && field.options) {
      const newOptions = [...field.options];
      newOptions[optionIndex] = value;
      updateField(fieldId, { options: newOptions });
    }
  };

  const removeOption = (fieldId: number, optionIndex: number) => {
    const field = formData?.fields?.find((f) => f.id === fieldId);
    if (field && field.options && field.options.length > 1) {
      const newOptions = field.options.filter(
        (_, index) => index !== optionIndex
      );
      updateField(fieldId, { options: newOptions });
    }
  };

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
    if (formData.assignee?.departmentId) {
      fetchDepartmentPositions({
        filters: [
          {
            key: "departmentId",
            value: formData.assignee?.departmentId || "",
            condition: "equal",
          },
        ],
        limit: 1000,
        offset: 0,
      });
    }
  }, [formData.assignee?.departmentId]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "departmentId") {
      const selectedDepartment = departments.rows.find(
        (dept) => dept.id === Number(value)
      );
      if (selectedDepartment)
        setStageData((prev) => ({
          ...prev,
          assignee: {
            ...prev?.assignee,
            departmentName: selectedDepartment.name,
            departmentId: value,
            positionName: "",
            positionId: "",
          },
        }));
    } else if (name === "positionId") {
      let selectedPosition: any;
      if (formData.assignToRequestorDepartment) {
        selectedPosition = [...genericPositions].find(
          (position) => position.id === value
        );
      } else {
        selectedPosition = positions?.find(
          (position) => Number(position.id) === Number(value)
        );
      }

      if (selectedPosition && selectedPosition.title)
        setStageData((prev) => ({
          ...prev,
          assignee: {
            departmentId: prev?.assignee?.departmentId || "",
            departmentName: prev?.assignee?.departmentName || "",
            positionName: selectedPosition?.title || "",
            positionId: value,
          },
        }));
    } else {
      setStageData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSaveStage = () => {
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
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignee
                </label>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="assignToRequestor"
                    checked={formData.assignToRequestor}
                    onChange={(e) =>
                      setStageData((prev) => ({
                        ...prev,
                        assignToRequestor: e.target.checked,
                        assignToRequestorDepartment: false,
                        isRequireApproval: false,
                        assignee: {
                          departmentName: "",
                          positionName: "",
                          positionId: "",
                          departmentId: "",
                        },
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

                {!formData.assignToRequestor && (
                  <div className="border border-gray-300 p-3 rounded">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            id="assignToRequestorDepartment"
                            checked={formData.assignToRequestorDepartment}
                            onChange={(e) => {
                              setStageData((prev) => ({
                                ...prev,
                                assignToRequestorDepartment: e.target.checked,
                                assignee: {
                                  ...prev?.assignee,
                                  departmentName: "TBD",
                                  departmentId: "TBD",
                                  positionName: "TBD",
                                  positionId: "TBD",
                                },
                              }));
                            }}
                            className="mr-2"
                          />
                          <label
                            htmlFor="assignToRequestorDepartment"
                            className="text-sm text-gray-700"
                          >
                            Requestor Department
                          </label>
                        </div>
                        {formData.assignToRequestorDepartment ? (
                          <div className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                            {"Requestor Department"}
                          </div>
                        ) : (
                          <select
                            id="departmentId"
                            name="departmentId"
                            value={formData.assignee?.departmentId}
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
                      <div className="flex-1">
                        <div className="text-gray-700 text-sm mt-1 mb-2">
                          Search position
                        </div>

                        {formData.assignToRequestorDepartment ? (
                          <select
                            id="positionId"
                            name="positionId"
                            value={formData.assignee?.positionId}
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
                            id="positionId"
                            name="positionId"
                            value={formData.assignee?.positionId}
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
                    </div>

                    <div className="mt-3">
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
                        Require approval at this stage
                      </label>
                      <p className="ml-5 text-yellow-500 text-sm">
                        This will add approve, reject and comment
                        functionalities.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Add Fields
                </h3>
                <div className="space-y-2">
                  {fieldTypes.map((fieldType) => (
                    <button
                      key={fieldType.type}
                      onClick={() =>
                        addField(fieldType.type as FormField["type"])
                      }
                      className="w-full flex items-center space-x-3 p-1 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 cursor-pointer"
                    >
                      <div className="w-6 h-6 flex items-center justify-center">
                        <i className={`${fieldType.icon} text-gray-600`}></i>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {fieldType.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Stage Fields
                  </h3>

                  {formData?.fields?.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <i className="ri-file-list-3-line text-4xl mb-4"></i>
                      <p>
                        No fields added yet. Add fields from the left panel.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData?.fields?.map((field, index) => (
                        <div
                          key={field.id}
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, index)}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-2 hover:border-gray-300 cursor-move"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center">
                              <i className="ri-drag-move-line text-gray-400"></i>
                              <span className="text-sm font-medium text-gray-700 capitalize">
                                {field.type}
                              </span>
                            </div>
                            <button
                              onClick={() => removeField(field?.id)}
                              className="text-red-600 hover:text-red-800 cursor-pointer"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Label
                              </label>
                              <input
                                type="text"
                                value={field.label}
                                onChange={(e) =>
                                  updateField(field.id, {
                                    label: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              />
                            </div>

                            {field.type !== "checkbox" &&
                              field.type !== "file" && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Placeholder
                                  </label>
                                  <input
                                    type="text"
                                    value={field.placeholder || ""}
                                    onChange={(e) =>
                                      updateField(field.id, {
                                        placeholder: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                  />
                                </div>
                              )}
                          </div>

                          {(field.type === "select" ||
                            field.type === "radio") &&
                            field.options && (
                              <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Options
                                </label>
                                <div className="space-y-2">
                                  {field.options.map((option, optionIndex) => (
                                    <div
                                      key={optionIndex}
                                      className="flex items-center space-x-2"
                                    >
                                      <input
                                        type="text"
                                        value={option}
                                        onChange={(e) =>
                                          updateOption(
                                            Number(field.id),
                                            optionIndex,
                                            e.target.value
                                          )
                                        }
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                      />
                                      <button
                                        onClick={() =>
                                          removeOption(
                                            Number(field.id),
                                            optionIndex
                                          )
                                        }
                                        className="text-red-600 hover:text-red-800 cursor-pointer"
                                      >
                                        <i className="ri-close-line"></i>
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    onClick={() => addOption(Number(field.id))}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer"
                                  >
                                    <i className="ri-add-line mr-1"></i>
                                    Add Option
                                  </button>
                                </div>
                              </div>
                            )}

                          <div className="mt-4">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) =>
                                  updateField(field.id, {
                                    required: e.target.checked,
                                  })
                                }
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">
                                Required field
                              </span>
                            </label>
                          </div>

                          {field.type === "stage" && (
                            <div className="flex mt-4 justify-between items-center">
                              <div className="w-full">
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={field.isInternalStage}
                                    onChange={(e) =>
                                      updateField(field.id, {
                                        isInternalStage: e.target.checked,
                                      })
                                    }
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700">
                                    Internal stage
                                  </span>
                                </label>
                              </div>
                              <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Select form
                                </label>
                                <div className="w-full">
                                  <select
                                    id={field.id.toString()}
                                    name={field.id.toString()}
                                    value={field.value}
                                    onChange={(e) =>
                                      updateField(field.id, {
                                        formName: e.target.value,
                                      })
                                    }
                                    required={field.required}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm pr-8"
                                  >
                                    <option value="">Select an option</option>
                                    {/* TODO */}
                                    {field.selectOption?.map((option, idx) => (
                                      <option key={idx} value={option.value}>
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
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
        </div>
      </main>
    </div>
  );
}
