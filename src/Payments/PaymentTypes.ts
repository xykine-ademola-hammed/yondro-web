export interface Requestor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Workflow {
  id: number;
  name: string;
}

export interface Entity {
  id: number;
  requestor_id: number;
  workflow_id: number;
  form_id: number;
  requestor: Requestor;
  workflow: Workflow;
  parentRequest: Entity;
}

export interface Voucher {
  id: number;
  voucher_number: string;
  status: string;
  total_amount: string;
  created_at: string;
  entity: Entity;
}

export type PaymentCategory = "TSA" | "GIFMIS";

export interface PaymentOption {
  id: string;
  name: string;
  category: PaymentCategory;
  subGroup: string;
}

export const PAYMENT_OPTIONS: PaymentOption[] = [
  { id: "tsa-igr", name: "IGR", category: "TSA", subGroup: "IGR" },
  { id: "tsa-tetfund", name: "Tetfund", category: "TSA", subGroup: "Tetfund" },
  {
    id: "tsa-revitalization",
    name: "Revitalization",
    category: "TSA",
    subGroup: "Revitalization",
  },
  {
    id: "gifmis-overhead",
    name: "Overhead",
    category: "GIFMIS",
    subGroup: "Overhead",
  },
  {
    id: "gifmis-capital",
    name: "Capital",
    category: "GIFMIS",
    subGroup: "Capital",
  },
  {
    id: "gifmis-personnel",
    name: "Personnel",
    category: "GIFMIS",
    subGroup: "Personnel",
  },
];
