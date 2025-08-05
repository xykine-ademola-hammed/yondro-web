// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrganization } from "../GlobalContexts/Organization-Context";
import moment from "moment";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { workflowRequests: pendingRequests } = useOrganization();

  return (
    <div className="">
      {/* Dashboard Content */}
      <main className="flex-1 sm:p-6 overflow-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-1 sm:p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                My Tasks
              </h3>
              <button
                onClick={() => navigate("new-request")}
                className="hidden sm:block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm sm:text-base w-full sm:w-auto"
              >
                <i className="fas fa-plus mr-2"></i>New Request
              </button>
            </div>
          </div>
          <div className="p-1 md:p-4">
            <div className="space-y-4">
              {pendingRequests.rows.map((request) => (
                <div
                  key={request.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white"
                >
                  {/* ID and Date */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 space-y-1 sm:space-y-0">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-gray-700 sm:text-base md:text-lg">
                        {request.workflow?.name}
                      </span>

                      <span
                        className={`text-sm font-medium px-2 py-1 rounded-full ${
                          request?.status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : request?.status === "Rejected"
                            ? "bg-red-100 text-red-800"
                            : request?.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {request?.status}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {moment(request.createdAt).format(
                        "MMMM Do YYYY, h:mm:ss a"
                      )}
                    </span>
                  </div>

                  {/* Employee and Department Info */}

                  {/* Status and Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="">
                      <p className="font-semibold text-gray-700 text-sm sm:text-base">
                        By: {request.requestor?.firstName}{" "}
                        {request.requestor?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {request.requestor?.position?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {request.requestor?.department?.name}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        id={`approve-${request.id}`}
                        onClick={() =>
                          navigate(`request-response/${request.id}`)
                        }
                        // onClick={() => handleDetailClick(request)}
                        className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm w-full sm:w-auto"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Floating button only on mobile */}
      <div className="sm:hidden fixed bottom-5 right-5 z-50">
        <button
          onClick={() => navigate("new-request")}
          className="flex items-center bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <i className="fas fa-plus mr-2"></i>New Request
        </button>
      </div>

      {/*       

      <RequestDetailViewModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        request={selectedRequest}
        onReject={handleRejectClick}
        onApprove={handleApproveClick}
      /> */}
    </div>
  );
};
export default Dashboard;
