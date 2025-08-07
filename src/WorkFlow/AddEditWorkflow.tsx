import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ModalWrapper from "../components/modal-wrapper";
import AddEditStageEditor, {
  emptyStageData,
} from "./widgets/AddEditStageEditor";
import StageViewCard from "./widgets/StageViewCard";
import type { StageData, WorkFlow } from "../common/types";
import { useMutation } from "@tanstack/react-query";
import { getMutationMethod } from "../common/api-methods";
import { useAuth } from "../GlobalContexts/AuthContext";
import { useOrganization } from "../GlobalContexts/Organization-Context";
import { useToast } from "../GlobalContexts/ToastContext";
import useForm from "../common/useForms";

export default function AddEditWorkflow() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { forms } = useForm();
  const { fetchWorkFlows, workflowFilter } = useOrganization();

  const workflowId = location.pathname.split("/").pop() || "0";

  const [isOpenStageModal, setIsOpenStageModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState<StageData>({
    ...emptyStageData,
  });

  const [selectedStageIndex, setSelectedStageIndex] = useState<number>(0);

  const [formData, setFormData] = useState<WorkFlow>({
    name: "",
    description: "",
    stages: [],
    status: "",
    createdAt: "",
    formId: "",
  });

  const handleSubmitStage = (stageIndex: number, stageData: StageData) => {
    const fieldTypedStage = stageData.fields.filter(
      (field) => field.type === "stage"
    );

    console.log("-------------StageData--------", stageData);

    let newStages = [...formData.stages];
    newStages[stageIndex] = {
      ...stageData,
      organizationId: user?.organization?.id,
      departmentId: Number(user?.department?.id),
      step: stageIndex,
      // requiresInternalLoop: fieldTypedStage.length > 0,
    };

    setFormData({
      ...formData,
      stages: newStages,
    });
  };

  const removeStage = (index: number) => {
    const newStages = formData.stages.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      stages: newStages,
    });
  };

  const { mutateAsync: createWorkflow } = useMutation({
    mutationFn: (body: WorkFlow) =>
      getMutationMethod("POST", `api/workflows`, body, true),
    onSuccess: (data) => {
      fetchWorkFlows(workflowFilter);
      showToast("Workflow successfully created", "success");
      navigate(-1);
    },
    onError: async (error) => {
      console.log(error?.message);
      showToast("Workflow creation unsuccessful", "error");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("--------HER-----", {
      ...formData,
      organizationId: user?.organization?.id,
    });

    createWorkflow({ ...formData, organizationId: user?.organization?.id });
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div>
      <div className="flex items-center space-x-4 m-6">
        <Link
          to="/workflows"
          className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
        >
          <i className="fas fa-arrow-left text-gray-600"></i>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {workflowId !== "new" ? "Edit" : "Create New "} Workflow
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Workflow Name *
            </label>
            <input
              type="text"
              required
              value={formData?.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter workflow name"
            />
          </div>

          <div>
            <label
              htmlFor="department"
              className="block text-sm font-medium text-gray-700"
            >
              Form <span className="text-red-500">*</span>
            </label>
            <select
              name="formId"
              id="formId"
              value={formData?.formId}
              onChange={(e) =>
                setFormData({ ...formData, formId: e.target.value })
              }
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              required
            >
              <option value="">Select form</option>
              {forms.map((form) => (
                <option key={form.id} value={form.id}>
                  {form.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData?.description}
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
              onClick={() => {
                setSelectedStageIndex(formData.stages.length);
                setSelectedStage(emptyStageData);
                setIsOpenStageModal(true);
              }}
              className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-200 cursor-pointer"
            >
              Add Stage
            </button>
          </div>
          <div className="space-y-3">
            {formData?.stages.map((stage, index) => (
              <div key={index} className="items-center space-x-2 ">
                {formData.stages.length > 0 && (
                  <div className="flex w-full bg-white shadow-md rounded-lg p-3 items-start justify-between">
                    <StageViewCard {...stage} />
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStageIndex(index);
                          setSelectedStage(stage);
                          setIsOpenStageModal(true);
                        }}
                        className="text-green-600 bg-green-200 px-4 py-1 rounded hover:text-green-800 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => removeStage(index)}
                        className="text-red-600 bg-red-200 px-4 py-1 rounded hover:text-red-800 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
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
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium whitespace-nowrap cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium whitespace-nowrap cursor-pointer"
          >
            Submit
          </button>
        </div>
      </form>
      <ModalWrapper
        isOpen={isOpenStageModal}
        onClose={() => {
          setIsOpenStageModal(false);
        }}
        title={""}
      >
        <AddEditStageEditor
          formId={formData?.formId}
          setIsOpenStageModal={setIsOpenStageModal}
          selectedStageIndex={selectedStageIndex}
          selectedStage={selectedStage}
          onSubmit={handleSubmitStage}
        />
      </ModalWrapper>
    </div>
  );
}
