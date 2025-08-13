"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import FormPreviewViewModal from "./FormPreviewModal";
import useForm from "../common/useForms";

export default function FormList() {
  const [previewForm, setPreviewForm] = useState<any>(null);

  const { forms, getFormById } = useForm();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Draft":
        return "bg-yellow-100 text-yellow-800";
      case "Inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forms.map((form) => (
          <div
            key={form.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {form.name}
              </h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  form.status
                )}`}
              >
                {form.status}
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-4">{form.description}</p>

            <div className="space-y-2 mb-4 text-sm text-gray-500">
              <div>Created by: {form.createdBy}</div>
              <div>Updated: {form.lastUpdated}</div>
            </div>

            {form.workflows.length > 0 && (
              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-1">
                  Used in workflows:
                </div>
                <div className="flex flex-wrap gap-1">
                  {form.workflows.map((workflow, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                    >
                      {workflow}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Link
                to={`/forms/${form.id}`}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-center hover:bg-blue-700 font-medium text-sm whitespace-nowrap cursor-pointer"
              >
                Edit Form
              </Link>
              <button
                onClick={() => setPreviewForm(getFormById(form.id))}
                className="bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200 font-medium text-sm whitespace-nowrap cursor-pointer"
              >
                Preview
              </button>
            </div>
          </div>
        ))}
      </div>

      {previewForm && (
        <FormPreviewViewModal
          modalMode="preview"
          isOpen={previewForm !== null}
          form={previewForm}
          onClose={() => setPreviewForm(null)}
        />
      )}
    </>
  );
}
