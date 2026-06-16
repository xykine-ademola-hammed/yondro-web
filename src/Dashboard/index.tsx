// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { useMutation } from "@tanstack/react-query";
import { getMutationMethod } from "../common/api-methods";
import type { Employee, WorkFlow } from "../common/types";
import type { Department } from "../Request/DepartmentTypeahead";
import EmployeeTypeahead from "../Request/EmployeeTypeahead";
import RequestTypeSelector from "../Request/RequestTypeSelector";
import DepartmentTypeahead from "../Request/DepartmentTypeahead";
import { Select, statuses } from "../Request";
import { BanknoteArrowUp, MailPlus, MessageCircleMore } from "lucide-react";
import { SendEmailModal } from "../common/SendEmail";
import ChatComponentModal from "../common/ChatComponentModal";
import { useAuth } from "../GlobalContexts/AuthContext";
import { useAppContext } from "../GlobalContexts/AppContext";

export interface PendingInboxRow {
  stageId: number;
  stageName: string;
  stageStatus: string;
  stageStep: string;
  stageCreatedAt: Date;
  stageUpdatedAt: Date;

  requestId: number;
  requestStatus: string;
  requestCreatedAt: Date;
  requestUpdatedAt: Date;
  requestFormId: number;
  requestWorkflowId: number;
  departmentName?: string;

  messageCount?: number;

  workflowId: number;
  workflowFormId: number;
  workflowName: string;
  workflowDescription: string | null;

  requestorId: number;
  requestorFirstName: string;
  requestorLastName: string;
  requestorEmail: string;
  requestorDepartmentId: number | null;
}

export interface PendingInboxResult {
  items: PendingInboxRow[];
  totalItems: number;
  totalPages: number;
  page: number;
  limit: number;
}

const Dashboard: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const {
    addToPaymentPool,
    selectedRequestPaymentPool,
    selectedRequestPoolIds,
  } = useAppContext();
  console.log("--- SELECTED REQ IDS ----", selectedRequestPaymentPool.length);
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<WorkFlow | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    undefined
  );
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );

  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [openEmailModal, setOpenEmailModal] = useState(false);
  const [openChatModal, setOpenChatModal] = useState(false);

  const [selectedRequest, setSelectedRequest] =
    useState<PendingInboxRow | null>(null);

  const [myPendingRequest, setPendingRequest] =
    useState<PendingInboxResult | null>(null);

  const { mutateAsync: fetchWorkflowInstanceStages } = useMutation({
    mutationFn: (body: any) =>
      getMutationMethod(
        "POST",
        `api/workflow-instance-stages/mine`,
        body,
        true
      ),
    onSuccess: (data) => {
      setPendingRequest(data);
    },
    onError: (err) => console.error("Failed to fetch workflow requests:", err),
  });

  useEffect(() => {
    fetchWorkflowInstanceStages({
      departmentId: selectedDepartment?.id,
      employeeId: selectedEmployee?.id,
      status: selectedStatus ? selectedStatus : undefined,
      formId: selectedType?.formId,
      limit,
      offset: page - 1,
    });
  }, [
    page,
    limit,
    selectedStatus,
    selectedType,
    selectedEmployee,
    selectedDepartment,
  ]);

  const clearFilters = () => {
    setSelectedType(null);
    setSelectedStatus(undefined);
    setSelectedDepartment(null);
    setSelectedEmployee(null);
    setLimit(10);
    setPage(1);
  };



  return (
    <div className="">
      {/* Dashboard Content */}
      <main className="flex-1 sm:p-6 overflow-auto">
        <div className="my-2">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:mb-6 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                Pending Tasks
              </h1>
              <p className="text-sm text-slate-600">
                Track all tasks than need attention.
              </p>
            </div>

            <div className="p-1 sm:p-4">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {hasPermission("process_payments") && (
                  <button
                    type="button"
                    onClick={() => navigate("process-payments")}
                    className="hidden sm:block relative flex items-center justify-center bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm h-9 px-4"
                  >
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-semibold h-4 w-4 flex items-center justify-center rounded-full">
                      {selectedRequestPaymentPool.length}
                    </span>
                    Payment Pool
                  </button>
                )}

                <button
                  onClick={() => navigate("new-request")}
                  className="hidden sm:block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm sm:text-base w-full sm:w-auto"
                >
                  <i className="fas fa-plus mr-2"></i>New Request
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileFiltersOpen((v) => !v)}
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 md:hidden"
              >
                <i className="fas fa-sliders-h mr-2" />
                Filters
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:block">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-1 flex-col gap-4 sm:flex-row">
                <EmployeeTypeahead
                  label="Employee"
                  value={selectedEmployee}
                  onChange={(selected) => setSelectedEmployee(selected)}
                  placeholder="Search department"
                />

                <RequestTypeSelector
                  value={selectedType}
                  onChange={setSelectedType}
                />
                <Select
                  label="Status"
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  options={statuses}
                />
                <DepartmentTypeahead
                  label="Employee Department"
                  value={selectedDepartment}
                  onChange={setSelectedDepartment}
                  placeholder="Search department"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={clearFilters}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Filters Panel */}
          {mobileFiltersOpen && (
            <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:hidden">
              <EmployeeTypeahead
                label="Employee"
                value={selectedEmployee}
                onChange={(selected) => setSelectedEmployee(selected)}
                placeholder="Search department"
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <RequestTypeSelector
                  value={selectedType}
                  onChange={setSelectedType}
                />
                <Select
                  label="Status"
                  value={selectedStatus ?? ""}
                  onChange={setSelectedStatus}
                  options={statuses}
                />
                <DepartmentTypeahead
                  value={selectedDepartment}
                  onChange={setSelectedDepartment}
                  placeholder=""
                />
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={clearFilters}
                  className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Clear
                </button>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="">
          <div className="p-1 md:p-4">
            <div className="space-y-4">
              {myPendingRequest?.items?.map((request) => (
                <div
                  key={request.stageId}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white"
                >
                  {/* ID and Date */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 space-y-1 sm:space-y-0">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-gray-700 sm:text-base md:text-lg">
                        {request.workflowName}
                      </span>

                      <span
                        className={`text-sm font-medium px-2 py-1 rounded-full ${request?.stageStatus === "Approved"
                            ? "bg-green-100 text-green-800"
                            : request?.stageStatus === "Rejected"
                              ? "bg-red-100 text-red-800"
                              : request?.stageStatus === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {request?.stageStatus}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {moment(request.stageCreatedAt).format(
                        "MMMM Do YYYY, h:mm:ss a"
                      )}
                    </span>
                  </div>

                  {/* Employee and Department Info */}

                  {/* Status and Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="">
                      <p className="font-semibold text-gray-700 text-sm sm:text-base">
                        By: {request.requestorFirstName}{" "}
                        {request.requestorLastName}
                      </p>
                      {/* <p className="text-sm text-gray-600">
                        {request?.requestor?.position?.title}
                      </p> */}
                      <p className="text-sm text-gray-600">
                        {request.departmentName}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRequest(request);
                          if (request?.messageCount) {
                            setOpenChatModal(true);
                          } else {
                            setOpenEmailModal(true);
                          }
                        }}
                        className="relative flex items-center justify-center bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full text-sm h-9 px-4"
                      >
                        {request?.messageCount ? (
                          <MessageCircleMore className="h-4 w-4" />
                        ) : (
                          <MailPlus className="h-5 w-5" />
                        )}

                        {/* Notification Badge */}
                        {request?.messageCount && (
                          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-semibold h-4 w-4 flex items-center justify-center rounded-full">
                            {request?.messageCount}
                          </span>
                        )}
                      </button>

                      <button
                        disabled={selectedRequestPoolIds.includes(
                          request.requestId
                        )}
                        id={`approve-${request.requestId}`}
                        onClick={() => addToPaymentPool(request)}
                        className="relative flex items-center justify-center bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed transition-colors w-full text-sm h-9 px-4"
                      >
                        <BanknoteArrowUp className="h-5 w-5" />
                      </button>

                      <button
                        id={`approve-${request.requestId}`}
                        onClick={() =>
                          navigate(`request-response/${request.requestId}`)
                        }
                        // onClick={() => handleDetailClick(request)}
                        className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors w-full text-sm"
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

      {openEmailModal && selectedRequest?.workflowName && (
        <SendEmailModal
          entityType="REQUEST"
          entityId={selectedRequest?.requestId}
          defaultSubject={selectedRequest?.workflowName}
          onClose={() => setOpenEmailModal(false)}
          onSuccess={() => {
            fetchWorkflowInstanceStages({
              departmentId: selectedDepartment?.id,
              employeeId: selectedEmployee?.id,
              status: selectedStatus ? selectedStatus : undefined,
              formId: selectedType?.formId,
              limit,
              offset: page - 1,
            });
          }}
          onError={() => { }}
        />
      )}

      {openChatModal && (
        <ChatComponentModal
          isOpen={openChatModal}
          onClose={() => setOpenChatModal(false)}
          entityId={selectedRequest?.requestId}
          currentUserId={user?.id}
          title={selectedRequest?.workflowName}
          isSending={false}
          onSend={() => {
            fetchWorkflowInstanceStages({
              departmentId: selectedDepartment?.id,
              employeeId: selectedEmployee?.id,
              status: selectedStatus ? selectedStatus : undefined,
              formId: selectedType?.formId,
              limit,
              offset: page - 1,
            });
          }}
        />
      )}

      {/* Floating button only on mobile */}
      <div className="sm:hidden fixed top-15 right-5 z-50">
        <button
          onClick={() => navigate("new-request")}
          className="flex items-center bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <i className="fas fa-plus mr-2"></i> Request
        </button>
        {hasPermission("process_payments") && (
          <button
            onClick={() => navigate("process-payments")}
            type="button"
            className="mt-4 relative flex items-center justify-center bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full text-sm h-9 px-4"
          >
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-semibold h-4 w-4 flex items-center justify-center rounded-full">
              {selectedRequestPoolIds.length}
            </span>
            Payment Pool
          </button>
        )}
      </div>
    </div>
  );
};
export default Dashboard;
