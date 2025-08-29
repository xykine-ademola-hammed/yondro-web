import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import FormViewModal from "../FormPreviewModal";
import type { FormData, FormField } from "../../common/types";

const forms: { [key: string]: FormData } = {
  "1": {
    id: 1,
    name: "Leave Application Form",
    description: "Employee leave request form with date selection and reason",
    fields: [
      { id: 1, type: "text", label: "Employee Name", required: true },
      { id: 2, type: "email", label: "Email Address", required: true },
      { id: 3, type: "date", label: "Start Date", required: true },
      { id: 4, type: "date", label: "End Date", required: true },
      {
        id: 5,
        type: "select",
        label: "Leave Type",
        required: true,
        options: ["Vacation", "Sick Leave", "Personal", "Other"],
      },
      {
        id: 6,
        type: "textarea",
        label: "Reason",
        placeholder: "Please explain the reason for leave",
        required: true,
      },
      { id: 7, type: "text", label: "Manager Name", required: true },
      {
        id: 8,
        type: "checkbox",
        label: "I acknowledge the leave policy",
        required: true,
      },
    ],
  },
  "2": {
    id: 2,
    name: "Budget Request Form",
    description: "Department budget request with itemized breakdown",
    fields: [
      { id: 1, type: "text", label: "Department", required: true },
      { id: 2, type: "text", label: "Project Title", required: true },
      { id: 3, type: "number", label: "Total Amount", required: true },
      {
        id: 4,
        type: "select",
        label: "Budget Category",
        required: true,
        options: ["Operations", "Marketing", "Technology", "HR", "Other"],
      },
      { id: 5, type: "date", label: "Required By", required: true },
      { id: 6, type: "textarea", label: "Justification", required: true },
      { id: 7, type: "text", label: "Requested By", required: true },
      { id: 8, type: "email", label: "Contact Email", required: true },
    ],
  },
};

export default function FormCreatorEditor() {
  const params = useParams();

  const { formId } = params;

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    fields: [],
  });

  useEffect(() => {
    if (formId && formId !== "new") {
      setFormData(forms[formId]);
    }
  }, [formId]);

  const [draggedField, setDraggedField] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);

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
    setFormData((prev) => ({ ...prev, fields: [...prev.fields, newField] }));
  };

  const updateField = (fieldId: number, updates: Partial<FormField>) => {
    setFormData((prev) => {
      return {
        ...prev,
        fields: prev.fields.map((field) =>
          field.id === fieldId ? { ...field, ...updates } : field
        ),
      };
    });
  };

  const removeField = (fieldId?: number) => {
    setFormData((prev) => {
      return {
        ...prev,
        fields: prev.fields.filter((field) => field.id !== fieldId),
      };
    });
  };

  const moveField = (fromIndex: number, toIndex: number) => {
    if (!formData) return;
    const newFields = [...formData.fields];
    const [movedField] = newFields.splice(fromIndex, 1);
    newFields.splice(toIndex, 0, movedField);
    setFormData((prev) => {
      return { ...prev, fields: newFields };
    });
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
    const field = formData?.fields.find((f) => f.id === Number(fieldId));
    if (field && field.options) {
      updateField(Number(fieldId), {
        options: [...field.options, `Option ${field.options.length + 1}`],
      });
    }
  };

  const updateOption = (
    fieldId: number,
    optionIndex: number,
    value: string
  ) => {
    const field = formData?.fields.find((f) => f.id === Number(fieldId));
    if (field && field.options) {
      const newOptions = [...field.options];
      newOptions[optionIndex] = value;
      updateField(Number(fieldId), { options: newOptions });
    }
  };

  const removeOption = (fieldId: number, optionIndex: number) => {
    const field = formData?.fields.find((f) => f.id === Number(fieldId));
    if (field && field.options && field.options.length > 1) {
      const newOptions = field.options.filter(
        (_, index) => index !== optionIndex
      );
      updateField(fieldId, { options: newOptions });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link
                to="/forms"
                className="text-blue-600 hover:text-blue-800 mb-2 inline-block cursor-pointer"
              >
                <i className="ri-arrow-left-line mr-1"></i>
                Back to Forms
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {formId === "new" ? "Create" : "Edit"} Form
              </h1>
              <p className="text-gray-600">Modify form fields and settings.</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowPreview(true)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 font-medium whitespace-nowrap cursor-pointer"
              >
                Preview
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium whitespace-nowrap cursor-pointer">
                Save Form
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
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
                      className="w-full flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 cursor-pointer"
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
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="mb-8 pb-6 border-b border-gray-200">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Form Name
                      </label>
                      <input
                        type="text"
                        value={formData?.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData?.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Form Fields
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
                          className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-gray-300 cursor-move"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <i className="ri-drag-move-line text-gray-400"></i>
                              <span className="text-sm font-medium text-gray-700 capitalize">
                                {field.type}
                              </span>
                            </div>
                            <button
                              onClick={() => removeField(Number(field?.id))}
                              className="text-red-600 hover:text-red-800 cursor-pointer"
                            >
                              <i className="ri-delete-bin-line"></i>
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
                                  updateField(Number(field.id), {
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
                                      updateField(Number(field.id), {
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
                                  updateField(Number(field.id), {
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
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showPreview && formData && (
        <FormViewModal
          modalMode="preview"
          isOpen={showPreview}
          form={formData}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
