import React, { useEffect, useState } from "react";
import type {
  ApiFilter,
  Employee,
  EmployeeData,
  FormField,
  Position,
  StageData,
} from "./types";
import FieldRender from "../components/FieldRender";
import { useOrganization } from "../GlobalContexts/Organization-Context";
import { extractPositions } from "./methods";
import { useAuth } from "../GlobalContexts/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { getMutationMethod } from "./api-methods";

export interface FormViewProps {
  nextStage?: StageData;
  form?: StageData;
  modalMode: "view" | "preview";
  showSubmitButton: boolean;
  showFormTitle: boolean;
  onSubmit?: (formData: any) => void;
  onInputChange?: (field: string | number, value: string | File) => void;
}
export default function FormView({
  nextStage,
  showFormTitle,
  form,
  modalMode,
  showSubmitButton,
  onSubmit,
  onInputChange,
}: FormViewProps) {
  const { user } = useAuth();
  const [departmenttMembers, setDepartmenttMembers] = useState<Employee[]>();

  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { departments } = useOrganization();

  const handleInputChange = (fieldId: number | string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    onInputChange && onInputChange(fieldId, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const missingFields = form?.fields
      .filter((field) => field.required && !formData[field.id])
      .map((field) => field.label);

    if (missingFields && missingFields?.length > 0) {
      alert(
        `Please fill in the following required fields: ${missingFields.join(
          ", "
        )}`
      );
      return;
    }

    setIsSubmitting(true);

    if (modalMode !== "preview") onSubmit && onSubmit(formData);
  };

  const { mutateAsync: fetchDepartmentEmployees } = useMutation({
    mutationFn: (body: ApiFilter) =>
      getMutationMethod("POST", `api/employees/get-employees`, body, true),
    onSuccess: (data) => {
      setDepartmenttMembers(data?.rows);
    },
    onError: (error) => {
      console.error("Failed to fetch positions:", error);
    },
  });

  console.log("---formData-----", formData);

  useEffect(() => {
    if (formData.currentDepartmentId) {
      fetchDepartmentEmployees({
        filters: [
          {
            key: "organizationId",
            value: user?.organization?.id,
            condition: "equal",
          },
          {
            key: "departmentId",
            value: formData.currentDepartmentId,
            condition: "equal",
          },
        ],
        limit: 10000,
        offset: 0,
      });
    }
  }, [formData.currentDepartmentId]);

  useEffect(() => {
    if (nextStage?.assignToRequestorDepartment && user?.department?.id) {
      setFormData((prev) => ({
        ...prev,
        currentDepartmentId: user?.department?.id,
      }));
      onInputChange &&
        onInputChange("currentDepartmentId", user?.department?.id);
    }
  }, [nextStage]);

  console.log("====nextStage=======", nextStage);

  return (
    <div className="t-6">
      <form
        onSubmit={handleSubmit}
        id={`preview-form-${form?.id}`}
        className="mx-auto"
      >
        {showFormTitle && (
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {form?.name}
            </h1>
            <p className="text-gray-600">{form?.description}</p>
          </div>
        )}

        <div className="space-y-6">
          {form?.fields.map((field) => (
            <div key={field.id}>
              {field.type !== "checkbox" && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
              )}
              <FieldRender
                handleInputChange={handleInputChange}
                formData={formData}
                field={field}
              />

              {field.type === "textarea" && (
                <div className="text-right text-xs text-gray-500 mt-1">
                  {(formData[field.id] || "").toString().length}/500 characters
                </div>
              )}
            </div>
          ))}
          Next Assignee(s)
          <div className="p-4 border rounded border-gray-300 mt-2 grid grid-cols-2 gap-4">
            {nextStage && nextStage.assignToRequestorDepartment && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department:
                </label>
                <div>{user?.department?.name}</div>
              </div>
            )}

            {nextStage &&
              !nextStage.assignToRequestorDepartment &&
              nextStage?.assignee?.departmentId === "TBD" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select department
                  </label>
                  <FieldRender
                    handleInputChange={handleInputChange}
                    formData={formData}
                    field={{
                      id: "currentDepartmentId",
                      type: "select",
                      label: "Select Department",
                      placeholder: "Select department",
                      required: true,
                      selectOption: departments?.rows.map((dept) => ({
                        id: Number(dept.id),
                        label: dept.name,
                        value: dept.id,
                      })),
                    }}
                  />
                </div>
              )}

            <div>
              {nextStage &&
                nextStage.assignToRequestorDepartment &&
                nextStage?.assignee?.positionId === "TBD" && (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select employee
                    </label>
                    <FieldRender
                      handleInputChange={handleInputChange}
                      formData={formData}
                      field={{
                        id: "employeeId",
                        type: "select",
                        label: "Select employee",
                        placeholder: "Select employee",
                        required: true,
                        selectOption: departmenttMembers?.map((member) => ({
                          id: Number(member.id),
                          label: `${member.firstName} ${member.lastName}`,
                          value: member.id,
                        })),
                      }}
                    />
                  </>
                )}
            </div>
          </div>
          {form?.isRequireApproval && (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment
              </label>
              <FieldRender
                handleInputChange={handleInputChange}
                formData={formData}
                field={{
                  id: "comment",
                  type: "textarea",
                  label: "Comment",
                  placeholder: "Enter comments",
                  required: true,
                }}
              />
            </>
          )}
        </div>

        <div className="mt-8 pt-6">
          <div className="flex items-center justify-between">
            {showSubmitButton && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="ri-send-plane-line mr-2"></i>
                    Save
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
