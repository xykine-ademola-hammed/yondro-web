import React, { createContext, useContext, useState, useEffect } from "react";
import type {
  ApiFilter,
  DepartmentData,
  EmployeeData,
  PositionData,
  SchoolOffice,
  SchoolOfficeData,
  WorkFlowData,
  WorkflowRequestData,
} from "../common/types";
import { useMutation } from "@tanstack/react-query";
import { getMutationMethod } from "../common/api-methods";
import { useAuth } from "./AuthContext";

interface OrganizationContextType {
  departments: DepartmentData;
  fetchDepartments: (apiFilter: ApiFilter) => Promise<void>;
  departmentFilter: ApiFilter;
  setDepartmentFilter: React.Dispatch<React.SetStateAction<ApiFilter>>;
  positions: PositionData;
  fetchPositions: (apiFilter: ApiFilter) => Promise<void>;
  positionFilter: ApiFilter;
  setPositionFilter: React.Dispatch<React.SetStateAction<ApiFilter>>;
  employees: EmployeeData;
  fetchEmployees: (apiFilter: ApiFilter) => Promise<void>;
  employeeFilter: ApiFilter;
  setEmployeeFilter: React.Dispatch<React.SetStateAction<ApiFilter>>;
  workflows: WorkFlowData;
  fetchWorkFlows: (apiFilter: ApiFilter) => Promise<void>;
  workflowFilter: ApiFilter;
  setWorkflowFilter: React.Dispatch<React.SetStateAction<ApiFilter>>;
  workflowRequests: WorkflowRequestData;
  fetchWorkflowRequest: (apiFilter: ApiFilter) => Promise<void>;
  workflowReqiestFilter: ApiFilter;
  setWorkflowReqiestFilter: React.Dispatch<React.SetStateAction<ApiFilter>>;
  userDepartmenttMembers: EmployeeData;
  fetchDepartmentEmployees: (apiFilter: ApiFilter) => Promise<void>;
  departmentEmployeeFilter: ApiFilter;
  schoolDeans: EmployeeData;
  fetchDeans: (apiFilter: ApiFilter) => Promise<void>;
  deansFilter: ApiFilter;
  schoolOffices: SchoolOfficeData;
  fetchSchoolOffices: (apiFilter: ApiFilter) => Promise<void>;
  schoolOfficeFilter: ApiFilter;
  setSchoolOfficeFilter: React.Dispatch<React.SetStateAction<ApiFilter>>;
}

// Create the context
const OrganizationContext = createContext<OrganizationContextType | undefined>(
  undefined
);

// Create a provider component
export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<DepartmentData>({
    rows: [],
    count: 0,
    hasMore: false,
  });

  const [positions, setPositions] = useState<PositionData>({
    rows: [],
    count: 0,
    hasMore: false,
  });

  const [employees, setEmployees] = useState<EmployeeData>({
    rows: [],
    count: 0,
    hasMore: false,
  });

  const [userDepartmenttMembers, setUserDepartmenttMembers] =
    useState<EmployeeData>({
      rows: [],
      count: 0,
      hasMore: false,
    });

  const [schoolDeans, setSchoolDeans] = useState<EmployeeData>({
    rows: [],
    count: 0,
    hasMore: false,
  });

  const [schoolOffices, setSchoolOffices] = useState<SchoolOfficeData>({
    rows: [],
    count: 0,
    hasMore: false,
  });

  const [workflows, setWorkflows] = useState<WorkFlowData>({
    rows: [],
    count: 0,
    hasMore: false,
  });

  const [workflowRequests, setWorkflowRequests] = useState<WorkflowRequestData>(
    {
      rows: [],
      count: 0,
      hasMore: false,
    }
  );

  const [departmentFilter, setDepartmentFilter] = useState<ApiFilter>({
    filters: [
      {
        key: "organizationId",
        value: user?.organizationId || "",
        condition: "equal",
      },
    ],
    limit: 250,
    offset: 0,
  });

  const [schoolOfficeFilter, setSchoolOfficeFilter] = useState<ApiFilter>({
    filters: [
      {
        key: "organizationId",
        value: user?.organizationId || "",
        condition: "equal",
      },
    ],
    limit: 250,
    offset: 0,
  });

  const departmentEmployeeFilter: ApiFilter = {
    filters: [
      {
        key: "organizationId",
        value: user?.organizationId || "",
        condition: "equal",
      },
      {
        key: "schoolOrOfficeId",
        value: user?.schoolOrOfficeId || "",
        condition: "equal",
      },
      // {
      //   key: "departmentId",
      //   value: user?.departmentId || "",
      //   condition: "equal",
      // },
    ],
    limit: 10000,
    offset: 0,
  };

  const deansFilter: ApiFilter = {
    filters: [
      {
        key: "organizationId",
        value: user?.organizationId || "",
        condition: "equal",
      },
      {
        key: "position.title",
        value: "Dean",
        condition: "contains",
      },
    ],
    limit: 10000,
    offset: 0,
  };

  const [positionFilter, setPositionFilter] = useState<ApiFilter>({
    filters: [
      {
        key: "organizationId",
        value: user?.organizationId || "",
        condition: "equal",
      },
    ],
    limit: 50,
    offset: 0,
  });

  const [employeeFilter, setEmployeeFilter] = useState<ApiFilter>({
    filters: [
      {
        key: "organizationId",
        value: user?.organizationId || "",
        condition: "equal",
      },
    ],
    limit: 50,
    offset: 0,
  });

  const [workflowReqiestFilter, setWorkflowReqiestFilter] = useState<ApiFilter>(
    {
      filters: [
        {
          key: "organizationId",
          value: user?.organizationId,
          condition: "equal",
        },
      ],
      limit: 50,
      offset: 0,
    }
  );

  const [workflowFilter, setWorkflowFilter] = useState<ApiFilter>({
    filters: [
      {
        key: "organizationId",
        value: user?.organizationId || "",
        condition: "equal",
      },
    ],
    limit: 50,
    offset: 0,
  });

  // Function to fetch organization data
  const { mutateAsync: fetchDepartments } = useMutation({
    mutationFn: (body: ApiFilter) =>
      getMutationMethod("POST", `api/departments/get-depts`, body, true),
    onSuccess: (data) => {
      setDepartments(data);
    },
    onError: (error) => {
      console.error("Failed to fetch departments:", error);
    },
  });

  const { mutateAsync: fetchSchoolOffices } = useMutation({
    mutationFn: (body: ApiFilter) =>
      getMutationMethod(
        "POST",
        `api/school-office/get-schoolOffices`,
        body,
        true
      ),
    onSuccess: (data) => {
      setSchoolOffices(data);
    },
    onError: (error) => {
      console.error("Failed to fetch Schools|Offices:", error);
    },
  });

  const { mutateAsync: fetchPositions } = useMutation({
    mutationFn: (body: ApiFilter) =>
      getMutationMethod("POST", `api/positions/get-positions`, body, true),
    onSuccess: (data) => {
      setPositions(data);
    },
    onError: (error) => {
      console.error("Failed to fetch positions:", error);
    },
  });

  const { mutateAsync: fetchEmployees } = useMutation({
    mutationFn: (body: ApiFilter) =>
      getMutationMethod("POST", `api/employees/get-employees`, body, true),
    onSuccess: (data) => {
      setEmployees(data);
    },
    onError: (error) => {
      console.error("Failed to fetch positions:", error);
    },
  });

  // Function to fetch organization data
  const { mutateAsync: fetchWorkFlows } = useMutation({
    mutationFn: (body: ApiFilter) =>
      getMutationMethod("POST", `api/workflows/get-workflows`, body, true),
    onSuccess: (data) => {
      setWorkflows(data);
    },
    onError: (error) => {
      console.error("Failed to fetch departments:", error);
    },
  });

  const { mutateAsync: fetchWorkflowRequest } = useMutation({
    mutationFn: (body: ApiFilter) =>
      getMutationMethod(
        "POST",
        `api/workflowrequest/get-workflow-request-tasks`,
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

  const { mutateAsync: fetchDepartmentEmployees } = useMutation({
    mutationFn: (body: ApiFilter) =>
      getMutationMethod("POST", `api/employees/get-employees`, body, true),
    onSuccess: (data) => {
      setUserDepartmenttMembers(data);
    },
    onError: (error) => {
      console.error("Failed to fetch positions:", error);
    },
  });

  const { mutateAsync: fetchDeans } = useMutation({
    mutationFn: (body: ApiFilter) =>
      getMutationMethod("POST", `api/employees/get-employees`, body, true),
    onSuccess: (data) => {
      setSchoolDeans(data);
    },
    onError: (error) => {
      console.error("Failed to fetch positions:", error);
    },
  });

  useEffect(() => {
    fetchWorkflowRequest(workflowReqiestFilter);
  }, [fetchWorkflowRequest, user?.id]);

  useEffect(() => {
    fetchDepartments(departmentFilter);
    fetchPositions(positionFilter);
    fetchEmployees(employeeFilter);
    fetchWorkFlows(workflowFilter);
    fetchDepartmentEmployees(departmentEmployeeFilter);
    fetchDeans(deansFilter);
    fetchSchoolOffices(schoolOfficeFilter);
  }, [user]);

  useEffect(() => {
    fetchEmployees(employeeFilter);
  }, [employeeFilter]);

  useEffect(() => {
    fetchPositions(positionFilter);
  }, [positionFilter]);

  return (
    <OrganizationContext.Provider
      value={{
        departments,
        departmentFilter,
        setDepartmentFilter,
        fetchDepartments,
        positions,
        fetchPositions,
        positionFilter,
        setPositionFilter,
        employees,
        fetchEmployees,
        setEmployeeFilter,
        employeeFilter,
        workflows,
        fetchWorkFlows,
        workflowFilter,
        setWorkflowFilter,
        workflowRequests,
        setWorkflowReqiestFilter,
        workflowReqiestFilter,
        fetchWorkflowRequest,
        userDepartmenttMembers,
        fetchDepartmentEmployees,
        departmentEmployeeFilter,
        schoolDeans,
        fetchDeans,
        deansFilter,
        schoolOffices,
        fetchSchoolOffices,
        schoolOfficeFilter,
        setSchoolOfficeFilter,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = (): OrganizationContextType => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error(
      "useOrganization must be used within an OrganizationProvider"
    );
  }
  return context;
};
