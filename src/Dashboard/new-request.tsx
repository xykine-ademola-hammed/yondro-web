import React, { useState } from "react";
import { useOrganization } from "../GlobalContexts/Organization-Context";
import type { Employee, StageData, WorkFlow } from "../common/types";
import FormView from "../common/FormView";
import { useAuth } from "../GlobalContexts/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { getMutationMethod } from "../common/api-methods";
import { useToast } from "../GlobalContexts/ToastContext";
import { useNavigate } from "react-router-dom";
import WorkflowDetail2 from "../components/RequestDetailView2";
import RequestFormWrapper from "../components/RequestFormWrapper";

export interface FormErrors {
  requestType?: string;
  employee?: string;
  description?: string;
  position?: string;
}

const NewRequest: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { workflowReqiestFilter, fetchWorkflowRequest } = useOrganization();
  const [errors, setErrors] = useState<FormErrors>({});
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number>();
  const [selectedWorkFlow, setSelectedWorkFlow] = useState<WorkFlow>();

  const { employees, workflows } = useOrganization();

  const { mutateAsync: createNewWorkflowRequest } = useMutation({
    mutationFn: (body: any) =>
      getMutationMethod("POST", `api/workflow-request`, body, true),
    onSuccess: (data) => {
      fetchWorkflowRequest(workflowReqiestFilter);
      navigate("/");
      showToast("Workflow request successfully created", "success");
    },
    onError: async (error) => {
      console.log(error?.message);
      showToast("Workflow request creation unsuccessful", "error");
    },
  });

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployeeId(employee.id);
    setEmployeeSearch(`${employee.firstName} ${employee.lastName}`);
    setShowEmployeeDropdown(false);
    if (errors.employee) {
      setErrors((prev) => ({ ...prev, employee: undefined }));
    }
  };

  const handleSubmit = async (formResponses) => {
    createNewWorkflowRequest({
      workflowId: selectedWorkFlow?.id,
      requestorId: selectedEmployeeId ?? user?.id,
      formResponses,
    });
  };

  return (
    <div>
      <main className="max-w-4xl mx-auto sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                New Request
              </h2>
              <p className="text-gray-600">
                Fill out the form below to submit a new request for approval.
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Request Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedWorkFlow?.id}
                      onChange={(e) => {
                        const foundWorkflow = workflows.rows.find(
                          (workflow) =>
                            Number(workflow.id) === Number(e.target.value)
                        );

                        setSelectedWorkFlow(foundWorkflow);
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer ${
                        errors.requestType
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select request type</option>
                      {workflows.rows.map((workflow) => (
                        <option key={workflow.id} value={workflow.id}>
                          {workflow.name}
                        </option>
                      ))}
                    </select>
                    <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                  </div>
                  {errors.requestType && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.requestType}
                    </p>
                  )}
                </div>
                {user?.role !== "Employee" && (
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={employeeSearch}
                        onChange={(e) => {
                          setEmployeeSearch(e.target.value);
                          setShowEmployeeDropdown(true);
                        }}
                        onFocus={() => setShowEmployeeDropdown(true)}
                        placeholder="Search and select employee"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer ${
                          errors.employee ? "border-red-300" : "border-gray-300"
                        }`}
                      />
                      <i className="fas fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>

                      {showEmployeeDropdown && employeeSearch && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {(() => {
                            const filteredEmployees = employees.rows.filter(
                              (emp) =>
                                emp.firstName
                                  ?.toLowerCase()
                                  .includes(employeeSearch.toLowerCase())
                            );

                            return filteredEmployees.length > 0 ? (
                              filteredEmployees.map((employee) => (
                                <div
                                  key={employee.id}
                                  onClick={() => handleEmployeeSelect(employee)}
                                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="font-medium text-gray-900">
                                    {employee.firstName} {employee.lastName}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {employee.department?.name}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-gray-500">
                                No employees found
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {selectedWorkFlow && (
                <RequestFormWrapper
                  onSubmit={handleSubmit}
                  onCancel={() => navigate("/")}
                  selectedWorkFlow={selectedWorkFlow}
                  mode="new"
                  currentWorkflowStage={selectedWorkFlow?.stages[0]}
                  showActionButtons={true}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {showEmployeeDropdown && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowEmployeeDropdown(false)}
        ></div>
      )}
    </div>
  );
};

export default NewRequest;
