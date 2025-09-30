// import AddEditWorkflowModal from "./AddEditWorkflowModal";
import { Link } from "react-router-dom";
import { useOrganization } from "../GlobalContexts/Organization-Context";
import { useState } from "react";

export default function WorkflowListing() {
  const { workflows } = useOrganization();
  const [showStages, setShowStages] = useState(false);

  //   const [editingWorkflow, setEditingWorkflow] = useState<WorkFlow | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {workflows?.rows?.map((workflow) => (
          <div
            key={workflow.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between flex-col sm:flex-row">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-l font-semibold text-gray-900">
                    {workflow?.name}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      workflow.isActive ? "active" : "inactive"
                    )}`}
                  >
                    {workflow.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{workflow.description}</p>

                <div className="flex items-center flex-wrap gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-500">
                    Stages:
                  </span>
                  <button
                    className="px-2 py-0.5 text-sm font-medium text-gray-500 bg-green-300 rounded hover:cursor-pointer"
                    onClick={() => setShowStages(!showStages)}
                  >
                    {workflow?.stages.length}
                  </button>
                  {showStages &&
                    workflow?.stages?.map((stage, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                      >
                        {stage.name}
                      </span>
                    ))}
                </div>
              </div>

              <div className="flex sm:flex-row md:flex-col sm:items-center md:sm:items-start space-x-4 space-y-2 mt-4 sm:mt-0 sm:ml-6 sm:flex-grow-0">
                <Link
                  to={`/workflows/${workflow.id}`}
                  className="flex items-center justify-center bg-blue-600 text-white px-3 w-full py-1.5 rounded-lg hover:bg-blue-700 whitespace-nowrap cursor-pointer text-sm"
                >
                  View Details
                </Link>
                {/* <Link
                  to={`/workflows/add-edit/${workflow.id}`}
                  className="flex items-center justify-center bg-gray-100 text-gray-700 px-3 w-full py-1.5 rounded-lg hover:bg-gray-200 whitespace-nowrap cursor-pointer text-sm"
                >
                  Edit
                </Link>
                <button className="bg-red-100 text-red-700 w-full px-3 py-1.5 rounded-lg hover:bg-red-200 whitespace-nowrap cursor-pointer text-sm">
                  Delete
                </button> */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
