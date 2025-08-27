import { useState } from "react";
import PaymentVoucher from "../Forms/widgets/PaymentVoucher-1";
import { head } from "lodash";
import StoreReceiptVoucher from "../Forms/widgets/StoreReceiptVoucher";
import StoreIssueVoucher from "../Forms/widgets/StoreIssueVoucher";
import ProcurementOrder from "../Forms/widgets/ProcurementOrder";
import JobMaintenanceRequisition from "../Forms/widgets/JobMaintenanceRequisition";
import PaymentVoucherSemiAuto from "../Forms/widgets/PaymentVoucher-1-semi-auto";

export interface FormProps {
  id: string | number;
  name: string;
  description: string;
  status: string;
  createdBy: string;
  lastUpdated: string;
  workflows: string[];
  component: (props: any) => JSX.Element;
  inputLabels: { [key: string]: string }; // Added inputLabels property
  assigneeHolders: { [key: string]: string };
  formSections: { [key: string]: string };
}

const useForm = () => {
  const [forms, setForms] = useState<any[]>([
    {
      id: 1,
      name: "Payment Voucher",
      description: "Employee leave request form with date selection and reason",
      status: "Active",
      createdBy: "Bursary",
      lastUpdated: "2024-01-10",
      workflows: ["Financial Request"],
      component: (props: any) => <PaymentVoucher {...props} />,
      inputLabels: {
        applicantName: "Name",
        applicantAddress: "Address",
        applicantDescription: "Request detail",

        paymentDate: "Payment Date",
        paymentParticles: "Particlars (Including References)",
        paymentDetailAmount: "Payment Detail Amount",
        amountInWord: "Amount in words",
        accountTitle: "Account Title",
        accountCodeNo: "Account Code No.",
        debitAmount: "Debit Amount",
        debitDescription: "Debit Description",
        creditAmount: "Credit Amount",
        creditDescription: "Credit Description",

        unitVoucherHeadById: "Head of Unit [Voucher]",
        preparedById: "Voucher Prepared By",
        reviewedById: "Voucher Reviewed By",
        approvedById: "Voucher Approved By",

        auditRemarkPass: "Audit Remark Pass",
        auditCheckedById: "Audit Checked by",
        auditCheckedByDate: "Audig Checked Date",
        auditRemarkQuery: "Audit Query",
        auditPreparedById: "Audit Prepared By",
        auditPreparedByDate: "Audit Prepared By Date",
        auditReviewedById: "Audit Reviewed By",
        auditReviewedByDate: "Audit Reviewed By Date",
        auditRemarkedById: "Audit Remarked By",
        auditApprovedByDate: "Audit Remarked By Date",

        cpoHeadById: "CPO Head of Unit",
        cpoPreparedById: "CPO Creator",
        cpoReviewedById: "CPO Reviewer",
        cpoApprovedById: "CPO Approver",

        additionalNotes: "Additional Notes",

        schoolDeanById: "School Dean",
        departmentHeadById: "Department Head",
        chiefExecutivedById: "Chief Executive",
      },
      assigneeHolders: {
        schoolDeanId: "School Dean",
        departmentHeadById: "Head of Department",
        unitVoucherHeadById: "Head of Unit [Voucher]",
        preparedById: "Voucher Prepared By",
        reviewedById: "Voucher Reviewed By",
        approvedById: "Voucher Approved By",
        auditCheckedById: "Audit Checked by",
        auditPreparedById: "Audit Prepared By",
        auditReviewedById: "Audit Reviewed By",
        auditRemarkedById: "Audit Approved By",
        cpoHeadById: "CPO Head of Unit",
        cpoPreparedById: "CPO Creator",
        cpoReviewedById: "CPO Reviewer",
        cpoApprovedById: "CPO Approver",
        schoolDeanById: "School Dean",
      },
      formSections: {
        showFormTitle: "Voucher Title",
        showApplicationFormTitle: "Application Title",
        instruction: "Instruction",
        applicantInformation: "Applicant Information",
        paymentDetails: "Payment Details",
        entryDistribution: "Entry Distribution",
        voucherApproval: "Voucher Approval",
        cpoApproval: "Central Payment Office",
        auditApproval: "Audit Approval",
        additionalInformation: "Additional Information",
        audit: "Audit Unit",
        fundAndManagement: "Fund and Management",
        approvals: "Approvals",
        showActionButtons: "Action buttons",
      },
    },
    {
      id: 2,
      name: "Store Receipt Voucher",
      description: "Please receive into Store the undermentioned stores",
      status: "Active",
      createdBy: "Store",
      lastUpdated: "2024-01-10",
      workflows: ["Store Receipt Voucher"],
      component: (props: any) => <StoreReceiptVoucher {...props} />,
      inputLabels: {
        voucherNo: "Voucher number",
        voucherDate: "Voucher Date",
        toTheCentralStores: "To The Central Stores",
        nameOfSupplier: "Name of Supplier",
        supplierAddress: "Supplier Address",
        articles: "Articles",
        denominationOfQty: "Denomination of Qty",
        qtyReceived: "Quantity Received",
        unitPrice: "Unit Price",
        amount: "Amount",
        ledgerFolio: "Ledger Folio",
      },
      assigneeHolders: {},
      formSections: {
        addMore: "Add more button",
      },
    },
    {
      id: 3,
      name: "Store Issue Voucher",
      description: "",
      status: "Active",
      createdBy: "Store",
      lastUpdated: "2024-01-10",
      workflows: ["Store Issue Voucher"],
      component: (props: any) => <StoreIssueVoucher {...props} />,
      inputLabels: {
        unit: "Unit/Department/School",
        applicationDate: "Application Date",
        sivNo: "SIV No",
        department: "Department",
        issueAuthoriseBy: "Issue Authorise By",
        designation: "Designation",
        articles: "Articles",
        denominationOfQty: "Denomination of Quantity",
        qtyDemanded: "Quantity Demanded",
        qtyIssued: "Quantity Issued",
        rate: "rate",
        amount: "amount",
        ledgerFolio: "Ledger Folio",
        remarks: "Remarks",
      },
      assigneeHolders: {},
      formSections: {
        addMore: "Add more button",
      },
    },
    {
      id: 4,
      name: "Procurement Order",
      description: "",
      status: "Active",
      createdBy: "Store",
      lastUpdated: "2024-01-10",
      workflows: ["Procurement Request"],
      component: (props: any) => <ProcurementOrder {...props} />,
      inputLabels: {
        requestorDeligation: "Department/School/Unit",
        itemName: "Item name",
        quantity: "Item quantity",
        additionalNotes: "Additional notes",
      },
      assigneeHolders: {},
      formSections: {
        addMore: "Add more button",
      },
    },
    {
      id: 5,
      name: "Job/Maintenance Requisition",
      description: "",
      status: "Active",
      createdBy: "Store",
      lastUpdated: "2024-01-10",
      workflows: ["Procurement Request"],
      component: (props: any) => <JobMaintenanceRequisition {...props} />,
      inputLabels: {
        requestorDeligation: "Department/School/Unit",
        date: "Date",
        location: "Location",
        recommendationNotes: "Recommendation Notes",
        description: "description",
      },
      assigneeHolders: {},
      formSections: {},
    },
    {
      id: 6,
      name: "Payment Voucher Semi Auto",
      description:
        "Employee finance request form with date selection and reason",
      status: "Active",
      createdBy: "Bursary",
      lastUpdated: "2024-01-10",
      workflows: ["Financial Request"],
      component: (props: any) => <PaymentVoucherSemiAuto {...props} />,
      inputLabels: {
        applicantName: "Name",
        applicantAddress: "Address",
        applicantDescription: "Request detail",

        paymentDate: "Payment Date",
        paymentParticles: "Particlars (Including References)",
        paymentDetailAmount: "Payment Detail Amount",
        amountInWord: "Amount in words",
        accountTitle: "Account Title",
        accountCodeNo: "Account Code No.",
        debitAmount: "Debit Amount",
        debitDescription: "Debit Description",
        creditAmount: "Credit Amount",
        creditDescription: "Credit Description",

        unitVoucherHeadById: "Head of Unit [Voucher]",
        preparedById: "Voucher Prepared By",
        reviewedById: "Voucher Reviewed By",
        approvedById: "Voucher Approved By",

        auditRemarkPass: "Audit Remark Pass",
        auditCheckedById: "Audit Checked by",
        auditCheckedByDate: "Audig Checked Date",
        auditRemarkQuery: "Audit Query",
        auditPreparedById: "Audit Prepared By",
        auditPreparedByDate: "Audit Prepared By Date",
        auditReviewedById: "Audit Reviewed By",
        auditReviewedByDate: "Audit Reviewed By Date",
        auditRemarkedById: "Audit Remarked By",
        auditApprovedByDate: "Audit Remarked By Date",

        cpoHeadById: "CPO Head of Unit",
        cpoPreparedById: "CPO Creator",
        cpoReviewedById: "CPO Reviewer",
        cpoApprovedById: "CPO Approver",

        additionalNotes: "Additional Notes",

        schoolDeanById: "School Dean",
        departmentHeadById: "Department Head",
        chiefExecutivedById: "Chief Executive",
      },
      assigneeHolders: {
        schoolDeanId: "School Dean",
        departmentHeadById: "Head of Department",
        unitVoucherHeadById: "Head of Unit [Voucher]",
        preparedById: "Voucher Prepared By",
        reviewedById: "Voucher Reviewed By",
        approvedById: "Voucher Approved By",
        auditCheckedById: "Audit Checked by",
        auditPreparedById: "Audit Prepared By",
        auditReviewedById: "Audit Reviewed By",
        auditRemarkedById: "Audit Approved By",
        cpoHeadById: "CPO Head of Unit",
        cpoPreparedById: "CPO Creator",
        cpoReviewedById: "CPO Reviewer",
        cpoApprovedById: "CPO Approver",
        schoolDeanById: "School Dean",
      },
      formSections: {
        showFormTitle: "Voucher Title",
        showApplicationFormTitle: "Application Title",
        instruction: "Instruction",
        applicantInformation: "Applicant Information",
        paymentDetails: "Payment Details",
        entryDistribution: "Entry Distribution",
        voucherApproval: "Voucher Approval",
        cpoApproval: "Central Payment Office",
        auditApproval: "Audit Approval",
        additionalInformation: "Additional Information",
        audit: "Audit Unit",
        fundAndManagement: "Fund and Management",
        approvals: "Approvals",
        showActionButtons: "Action buttons",
      },
    },
  ]);

  const addForm = (formData: Omit<FormProps, "id">) => {
    const newForm: FormProps = {
      id: Date.now().toString(),
      ...formData,
    };
    setForms((prevForms) => [...prevForms, newForm]);
  };

  const removeForm = (formId: string | number) => {
    setForms((prevForms) => prevForms.filter((form) => form.id !== formId));
  };

  const updateForm = (formId: string | number, updatedData: Partial<any>) => {
    setForms((prevForms) =>
      prevForms.map((form) =>
        form.id === formId ? { ...form, ...updatedData } : form
      )
    );
  };

  const getFormById = (formId: number) => {
    return forms.find((form) => form.id === Number(formId));
  };

  return {
    forms,
    addForm,
    removeForm,
    updateForm,
    getFormById,
  };
};

export default useForm;
