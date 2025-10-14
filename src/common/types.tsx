import type { WorkFlowStage } from "../WorkFlow/widgets/AddEditStageEditor";

export interface Organization {
  id?: number;
  name: string;
  category: string;
  departments?: Department[];
  location: string;
  type: string;
  logoUrl: string;
}

export interface Unit {
  id?: number;
  name: string;
  description?: string;
  organizationId?: string;
  financeCode?: string;
  subUnits?: Unit[];
}

export interface SchoolOffice {
  id?: number;
  name: string;
  description?: string;
  location?: string;
  organizationId?: string;
  financeCode?: string;
  departments?: Department[];
  positions?: Position[];
}

export interface Department {
  id?: number;
  name: string;
  description?: string;
  location?: string;
  organizationId?: string;
  financeCode?: string;
  units?: Unit[];
  positions: Position[];
}

export interface Position {
  id?: number;
  title: string;
  departmentName?: string;
  departmentId?: number;
  schoolOrOfficeId?: number;
  organizationId?: number;
  unitId?: number;
  parentPositionId?: number;
  description?: string;
  department?: Department;
  schoolOrOffice?: any;
  category?: string;
}

export interface Employee {
  id?: number;
  firstName: string;
  lastName: string;
  middleName: string;
  department?: Department;
  schoolOrOfficeId?: number;
  organizationId?: number;
  unitId?: number;
  position?: Position;
  departmentName?: string;
  positionName?: string;
  email: string;
  password?: string;
  phone: string;
  location: string;
  isActive: boolean;
  departmentId?: number;
  positionId?: number;
  role?: string;
  permissions?: string[];
}

export interface WorkFlow {
  id?: number;
  name: string;
  description: string;
  organizationId?: number;
  isActive: boolean;
  isAutoTrigger: boolean;
  childWorkflows?: string[];
  stages: WorkFlowStage[];
  createdAt: string;
  formId: string;
  status?: string;
}

export interface MiniUser {
  id: string;
  fullName: string;
  position: string;
  departmentName: string;
}

export interface StageType {
  id: number;
  organizationId: number;
  workflowId: number;
  name: string;
  step: number;
  fields: FormField[] | [];
}

export interface CurrentStageData {
  assignedTo: Employee;
  stage: WorkFlowStage;
  createdAt: Date;
  updatedAt: Date;
  comment: string;
  id: number;
  isResubmission: boolean;
  isSubStage: boolean;
  parentStageId?: number;
  status: string;
  stageName: string;
  step: number;
  stageId?: number;
  assignedToUserId?: number;
}

export interface StageCompletionData {
  stageId?: number;
  action: "Approve" | "Reject";
  comment?: string;
  fieldResponses?: Record<string, any>;
}

export interface StageData {
  id?: number;
  name?: string;
  workFlowRequestId?: number;
  description?: string;
  step?: number;
  fields: FormField[] | [];
  fieldResponses?: FormField[] | [];
  departmentId?: number;
  parentStageId?: number;
  organizationId?: number;
  formFields?: string[];
  isSubStage?: boolean;
  status?:
    | "Approved"
    | "Rejected"
    | "Under Review"
    | "Pending"
    | "Submitted"
    | "Current";
  assignee?: AssigneePosition;
  assignToRequestor?: boolean;
  assignToRequestorDepartment?: boolean;
  isRequireApproval?: boolean;
  createdAt?: string;
  createdBy?: string;
  comment?: string;
  requiresInternalLoop?: boolean;
  showProcessingForm?: boolean;
  assignedTo?: Employee;
  stageId?: number;
}

export interface PositionHolder {
  id: number;
  name: string;
}

export interface AssigneePosition {
  departmentId: string;
  departmentName: string;
  positionId: string;
  positionName: string;
  positionHolder?: PositionHolder;
}

export interface SelectOption {
  id: number;
  value: string | number | undefined;
  label: string;
}

export interface FormField {
  id: number | string;
  type:
    | "text"
    | "email"
    | "number"
    | "textarea"
    | "select"
    | "radio"
    | "checkbox"
    | "date"
    | "stage"
    | "file";
  label?: string;
  subStageInstruction?: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  selectOption?: SelectOption[];
  value?: string;
  isInternalStage?: boolean;
  formName?: string;
  formFields?: any;
}

export interface FormData {
  id?: number;
  name: string;
  description: string;
  fields: FormField[];
}

export interface WorkflowRequest {
  id: number;
  type: string;
  workflowId?: number;
  workflow?: WorkFlow;
  requestorId?: number;
  requestor?: Employee;
  creator?: Employee;
  organizationId?: number;
  createdBy: number;
  // To be used to pull current task [currentDepartmentI and currentPositionId]
  currentDepartmentId?: number; // Should be updated on every stage completed -> fetch the next stage by workflowId and nextStageStep
  currentPositionId?: number; //
  currentStageStep?: number;
  nextStageStep?: number;
  formId?: number;
  status: "Pending" | "Approved" | "Rejected" | "Under Review";
  parentRequestId?: number;

  // To be used to pull history
  stageCompletedBy?: number[];

  createdAt: string;
  stageResponses: StageData[];
  stages: StageData[];
  updatedAt: string;
  formResponses?: any;
}

export interface Filter {
  key?: string;
  value:
    | string
    | number
    | number[]
    | [number, number]
    | null
    | undefined
    | Filter[];
  condition:
    | "equal"
    | "not"
    | "gt"
    | "lt"
    | "between"
    | "startWith"
    | "endWith"
    | "contains"
    | "like"
    | "in"
    | "and"
    | "or"
    | "json-contains";
}

export interface ApiFilter {
  filters: Filter[];
  limit: number;
  offset: number;
}

export interface DepartmentData {
  rows: Department[];
  count: number;
  hasMore: boolean;
}

export interface PositionData {
  rows: Position[];
  count: number;
  hasMore: boolean;
}

export interface EmployeeData {
  rows: Employee[];
  count: number;
  hasMore: boolean;
}

export interface SchoolOfficeData {
  rows: SchoolOffice[];
  count: number;
  hasMore: boolean;
}

export interface WorkFlowData {
  rows: WorkFlow[];
  count: number;
  hasMore: boolean;
}

export interface WorkflowRequestData {
  rows: WorkflowRequest[];
  count: number;
  hasMore: boolean;
}
