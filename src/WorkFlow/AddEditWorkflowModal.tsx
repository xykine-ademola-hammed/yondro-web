import { useState } from "react";
import ModalWrapper from "../components/modal-wrapper";

interface EditWorkflowModalProps {
  onClose: () => void;
  workflowId?: number;
  modalMode: "edit" | "preview";
  isOpen: boolean;
  onSubmit: () => void;
}

export default function EditWorkflowModal({
  onClose,
  workflowId,
  modalMode = "edit",
  isOpen = false,
  onSubmit,
}: EditWorkflowModalProps) {
  const getWorkflowData = (id: number) => {
    const workflows: { [key: string]: any } = {
      "1": {
        name: "Leave Management",
        description:
          "Employee leave request approval process with HR and manager review",
        stages: [
          "Employee Request",
          "Manager Approval",
          "HR Approval",
          "Final Approval",
        ],
        approvalRequired: true,
        notifications: true,
      },
      "2": {
        name: "Budget Approval",
        description:
          "Multi-stage budget request and approval workflow for departments",
        stages: [
          "Department Request",
          "Finance Review",
          "Manager Approval",
          "Executive Approval",
        ],
        approvalRequired: true,
        notifications: true,
      },
      "3": {
        name: "Content Review",
        description:
          "Content creation and approval workflow for marketing materials",
        stages: ["Content Creation", "Review", "Legal Check", "Publication"],
        approvalRequired: true,
        notifications: true,
      },
      "4": {
        name: "Employee Onboarding",
        description: "Complete onboarding process for new employees",
        stages: ["Documentation", "Equipment Setup", "Training", "Evaluation"],
        approvalRequired: false,
        notifications: true,
      },
      "5": {
        name: "Project Proposal Review",
        description: "New project proposal evaluation and approval process",
        stages: [
          "Proposal Submission",
          "Technical Review",
          "Business Review",
          "Final Decision",
        ],
        approvalRequired: true,
        notifications: false,
      },
    };
    return workflows[id] || workflows["1"];
  };

  const [formData, setFormData] = useState(() =>
    getWorkflowData(workflowId ?? 0)
  );

  const addStage = () => {
    setFormData({
      ...formData,
      stages: [...formData.stages, ""],
    });
  };

  const removeStage = (index: number) => {
    const newStages = formData.stages.filter(
      (_: any, i: number) => i !== index
    );
    setFormData({
      ...formData,
      stages: newStages,
    });
  };

  const updateStage = (index: number, value: string) => {
    const newStages = [...formData.stages];
    newStages[index] = value;
    setFormData({
      ...formData,
      stages: newStages,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updating workflow:", formData);
    onSubmit();
    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={modalMode === "edit" ? "Edit Workflow" : ""}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Workflow Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter workflow name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe the workflow purpose and process"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Workflow Stages *
            </label>
            <button
              type="button"
              onClick={addStage}
              className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-200 cursor-pointer"
            >
              Add Stage
            </button>
          </div>
          <div className="space-y-3">
            {formData.stages.map((stage: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={stage}
                    onChange={(e) => updateStage(index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Stage ${index + 1} name`}
                  />
                </div>
                {formData.stages.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStage(index)}
                    className="text-red-600 hover:text-red-800 cursor-pointer"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.approvalRequired}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  approvalRequired: e.target.checked,
                })
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Require approval at each stage
            </span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.notifications}
              onChange={(e) =>
                setFormData({ ...formData, notifications: e.target.checked })
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Send email notifications
            </span>
          </label>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <i className="ri-alert-line text-yellow-600 mt-1"></i>
            <div>
              <h4 className="text-sm font-medium text-yellow-800">
                Important Notice
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                Modifying workflow stages may affect active tasks. Please ensure
                all stakeholders are informed of changes.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium whitespace-nowrap cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium whitespace-nowrap cursor-pointer"
          >
            Update Workflow
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
