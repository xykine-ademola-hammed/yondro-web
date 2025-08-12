// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.

import React, { useEffect, useState } from "react";
import type {
  ApiFilter,
  WorkflowRequest,
  WorkflowRequestData,
} from "../common/types";
import { useOrganization } from "../GlobalContexts/Organization-Context";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../GlobalContexts/AuthContext";
import { getMutationMethod } from "../common/api-methods";
import { useMutation } from "@tanstack/react-query";

const RequestList: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [workflowRequests, setWorkflowRequests] = useState<WorkflowRequestData>(
    {
      rows: [],
      count: 0,
      hasMore: false,
    }
  );
  const [workflowReqiestFilter, setWorkflowReqiestFilter] = useState<ApiFilter>(
    {
      filters: [
        {
          key: "organizationId",
          value: user?.organization?.id || "",
          condition: "equal",
        },
        {
          key: "stages.assignedToId",
          value: user?.id,
          condition: "equal",
        },
      ],
      limit: 50,
      offset: 0,
    }
  );

  const navigate = useNavigate();

  const { mutateAsync: fetchWorkflowRequest } = useMutation({
    mutationFn: (body: ApiFilter) =>
      getMutationMethod(
        "POST",
        `api/workflowrequest/get-request-history`,
        body,
        true
      ),
    onSuccess: (data) => {
      setWorkflowRequests(data);
    },
    onError: (error) => {
      console.error("Failed to fetch workflow requests:", error);
    },
  });

  useEffect(() => {
    fetchWorkflowRequest(workflowReqiestFilter);
  }, []);

  const departments = [
    "Engineering",
    "Marketing",
    "Sales",
    "Human Resources",
    "Finance",
    "Research & Development",
  ];
  const requestTypes = [
    "Position Transfer",
    "Salary Adjustment",
    "Promotion",
    "New Position Requisition",
  ];
  const statuses = ["Pending", "Approved", "Rejected", "Under Review"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Under Review":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const workflowStagesLength = (
    request: WorkflowRequest
  ): number | undefined => {
    if (request?.workflow?.stages?.length)
      return request?.workflow?.stages?.length;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 overflow-auto">
          {/* Search and Filter Bar */}
          <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
                  <input
                    type="text"
                    placeholder="Search requests by ID, employee, or type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div className="flex space-x-3">
                  <div className="relative">
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none cursor-pointer pr-8"
                    >
                      <option value="">All Types</option>
                      {requestTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <i className="fas fa-chevron-down absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
                  </div>
                  <div className="relative">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none cursor-pointer pr-8"
                    >
                      <option value="">All Status</option>
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <i className="fas fa-chevron-down absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
                  </div>
                  <div className="relative">
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none cursor-pointer pr-8"
                    >
                      <option value="">All Departments</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                    <i className="fas fa-chevron-down absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Should be hidden on large screen */}
          <div className="block md:hidden space-y-4 px-4">
            {workflowRequests.rows.map((request) => (
              <div
                key={request.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex space-x-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>
                  </div>
                </div>
                <div className="text-center mb-4">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {request.workflow?.name}
                  </h3>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <i className="fas fa-user w-4 text-center mr-2"></i>
                    <span>
                      {" "}
                      {request.requestor?.firstName}{" "}
                      {request.requestor?.lastName}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <i className="fas fa-building w-4 text-center mr-2"></i>
                    <span>{request.requestor?.department?.name}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <i className="fas fa-calendar w-4 text-center mr-2"></i>
                    <span>
                      {moment(request.createdAt).format("YYYY/MM/DD")}
                    </span>
                  </div>
                </div>
                {request?.workflow?.stages?.length !== undefined && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">
                        Workflow Progress
                      </span>
                      <span className="text-xs text-gray-500">
                        {(
                          (request?.stages?.length * 100) /
                          request?.workflow?.stages?.length
                        ).toFixed(2)}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${
                            (request?.stages?.length /
                              request?.workflow?.stages?.length) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`request-response/${request.id}`)}
                    className="flex-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-md hover:bg-blue-100 transition-colors cursor-pointer !rounded-button whitespace-nowrap text-sm"
                  >
                    <i className="fas fa-eye mr-2"></i>View
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Should be hidden on smaller screen */}
          <div className="hidden md:block bg-white shadow rounded-lg overflow-hidden mt-6">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workflowRequests.rows.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.workflow?.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {request.requestor?.firstName}{" "}
                        {request.requestor?.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.requestor?.department?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          {request?.workflow?.stages?.length !== undefined && (
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${
                                  (request?.stages?.length /
                                    request?.workflow?.stages?.length) *
                                  100
                                }%`,
                              }}
                            ></div>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {request?.stages?.length}/
                          {request?.workflow?.stages?.length}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            navigate(`request-response/${request.id}`)
                          }
                          className="bg-blue-300 py-2 px-2 rounded text-blue-600 hover:text-blue-900 cursor-pointer"
                        >
                          <i className="fas fa-eye mr-2"> </i>
                          <span>View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {workflowRequests?.rows?.length} of{" "}
              {workflowRequests.count} requests
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 cursor-pointer !rounded-button whitespace-nowrap">
                Previous
              </button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm cursor-pointer !rounded-button whitespace-nowrap">
                1
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 cursor-pointer !rounded-button whitespace-nowrap">
                2
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 cursor-pointer !rounded-button whitespace-nowrap">
                Next
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RequestList;
