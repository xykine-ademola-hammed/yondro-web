import React from "react";
import type { FormField } from "../common/types";
import { useOrganization } from "../GlobalContexts/Organization-Context";

export interface FieldRenderProps {
  handleInputChange: (fieldId: number | string, value: any) => void;
  formData: { [key: string]: any };
  field: FormField;
}

const FieldRender: React.FC<FieldRenderProps> = ({
  field,
  handleInputChange,
  formData,
}) => {
  const value = formData[field.id] || "";
  const { userDepartmenttMembers } = useOrganization();
  const employeeOptions = userDepartmenttMembers.rows.map((employee) => ({
    id: employee.id,
    value: employee.id,
    label: `${employee.firstName} - ${employee.lastName} `,
  }));

  switch (field.type) {
    case "text":
    case "email":
    case "number":
      return (
        <input
          type={field.type}
          id={field.id.toString()}
          name={field.id.toString()}
          value={value}
          onChange={(e) => handleInputChange(field.id, e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      );

    case "textarea":
      return (
        <textarea
          id={field.id.toString()}
          name={field.id.toString()}
          value={value}
          onChange={(e) => handleInputChange(field.id, e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          rows={4}
          maxLength={500}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      );

    case "select":
      return (
        <div className="relative">
          <select
            id={field.id.toString()}
            name={field.id.toString()}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm pr-8"
          >
            <option value="">Select an option</option>
            {field.selectOption?.map((option, idx) => (
              <option key={idx} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );
    case "stage":
      return (
        <div className="relative">
          <select
            id={field.id.toString()}
            name={field.id.toString()}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm pr-8"
          >
            <option value="">Select an option</option>
            {employeeOptions?.map((employee) => (
              <option key={employee.id} value={employee.value}>
                {employee.label}
              </option>
            ))}
          </select>
        </div>
      );

    case "radio":
      return (
        <div className="space-y-2">
          {field.options?.map((option, idx) => (
            <label key={idx} className="flex items-center space-x-2">
              <input
                type="radio"
                name={field.id.toString()}
                value={option}
                checked={value === option}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                required={field.required}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      );

    case "checkbox":
      return (
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={field.id.toString()}
            name={field.id.toString()}
            checked={value === true}
            onChange={(e) => handleInputChange(field.id, e.target.checked)}
            required={field.required}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">{field.label}</span>
        </label>
      );

    case "date":
      return (
        <input
          type="date"
          id={field.id.toString()}
          name={field.id.toString()}
          value={value}
          onChange={(e) => handleInputChange(field.id, e.target.value)}
          required={field.required}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      );

    case "file":
      return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <input
            type="file"
            id={field.id.toString()}
            name={field.id.toString()}
            onChange={(e) => handleInputChange(field.id, e.target.files?.[0])}
            required={field.required}
            className="hidden"
          />
          <label htmlFor={field.id.toString()} className="cursor-pointer">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-upload text-gray-500 text-xl"></i>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-400">
              PDF, DOC, DOCX, JPG, PNG (max 10MB)
            </p>
          </label>
          {value && (
            <div className="mt-3 text-sm text-green-600">
              File selected: {value.name}
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
};

export default FieldRender;
