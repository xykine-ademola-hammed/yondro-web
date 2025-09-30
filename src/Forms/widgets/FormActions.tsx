import React from "react";

type FormActionMode = "new" | "edit" | string;

interface FormActionsProps {
  loading: boolean;
  handleCancel: () => void;
  mode: FormActionMode;
  handleSubmit: (action: string) => void;
  responseTypes: string[];
}

const responseButtonProps: Record<
  string,
  {
    bgColor: string; // Tailwind color base
    label: string;
    action: (handleSubmit: (action: string) => void) => void;
    cls: string; // Static class for Tailwind
  }
> = {
  Reject: {
    bgColor: "red",
    label: "Reject",
    action: (handleSubmit) => handleSubmit("Reject"),
    cls: "bg-red-500 hover:bg-red-600 focus:ring-red-500",
  },
  Approve: {
    bgColor: "green",
    label: "Approve",
    action: (handleSubmit) => handleSubmit("Approve"),
    cls: "bg-green-500 hover:bg-green-600 focus:ring-green-500",
  },
  Approval: {
    bgColor: "green",
    label: "Approve",
    action: (handleSubmit) => handleSubmit("Approve"),
    cls: "bg-green-500 hover:bg-green-600 focus:ring-green-500",
  },
  Acknowledgement: {
    bgColor: "green",
    label: "Acknowledgement",
    action: (handleSubmit) => handleSubmit("Acknowledgement"),
    cls: "bg-green-500 hover:bg-green-600 focus:ring-green-500",
  },
  Recommend: {
    bgColor: "green",
    label: "Recommend",
    action: (handleSubmit) => handleSubmit("Recommend"),
    cls: "bg-green-500 hover:bg-green-600 focus:ring-green-500",
  },
  Payment: {
    bgColor: "green",
    label: "Approve payment",
    action: (handleSubmit) => handleSubmit("Payment"),
    cls: "bg-green-500 hover:bg-green-600 focus:ring-green-500",
  },
  Procurement: {
    bgColor: "blue",
    label: "Approve procurement",
    action: (handleSubmit) => handleSubmit("Procurement"),
    cls: "bg-blue-500 hover:bg-blue-600 focus:ring-blue-500",
  },
};

const FormActions: React.FC<FormActionsProps> = ({
  loading,
  handleCancel,
  mode,
  handleSubmit,
  responseTypes,
}) => {
  return (
    <div className="flex justify-end space-x-4 mt-6">
      <button
        onClick={handleCancel}
        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
        type="button"
      >
        Cancel
      </button>

      {mode === "new" ? (
        <button
          disabled={loading}
          onClick={() => handleSubmit("Submit")}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="button"
        >
          {loading ? "Processing..." : "Submit"}
        </button>
      ) : (
        <>
          <button
            disabled={loading}
            onClick={() => handleSubmit("Reject")}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            type="button"
          >
            Reject
          </button>
          {Array.isArray(responseTypes) &&
            responseTypes.map((response) => {
              const btn = responseButtonProps[response];
              if (!btn) return null;
              return (
                <button
                  disabled={loading}
                  key={response}
                  onClick={() => btn.action(handleSubmit)}
                  className={`px-4 py-2 ${btn.cls} text-white rounded-md focus:outline-none focus:ring-2`}
                  type="button"
                >
                  {loading ? "Processing..." : btn.label}
                </button>
              );
            })}
        </>
      )}
    </div>
  );
};

export default FormActions;
