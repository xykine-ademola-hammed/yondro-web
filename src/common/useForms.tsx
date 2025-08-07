import { useState } from "react";
import PaymentVoucher from "../Forms/widgets/PaymentVoucher-1";

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
        ammountInWord: "Amount in words",
        accountTitle: "Account Title",
        accountCodeNo: "Account Code No.",
        debitAmmount: "Debit Amount",
        debitDescription: "Debit Description",
        creditAmmount: "Credit Amount",
        creditDescription: "Credit Description",
        unitVoucherHeadById: "Head of Unit [Voucher]",
        preparedById: "Voucher Prepared By",
        reviewedById: "Voucher Reviewed By",
        approvedById: "Voucher Approved By",
        checkedById: "Checked by",
        checkedByDate: "Checked by Date",
        auditRemarkPass: "Pass",
        auditRemarkQuery: "Query",
        auditPreparedById: "Audit Prepared By",
        auditPreparedByDate: "Audit Prepared By Date",
        auditReviewedById: "Audit Reviewed By",
        auditReviewedByDate: "Audit Reviewed By Date",
        auditApprovedById: "Audit Approved By",
        auditApprovedByDate: "Audit Approved By Date",
        additionalNotes: "Additional Notes",
        paymentDate: "Payment Date",
        paymentParticles: "Particlars (Including References)",
        paymentAmmount: "Payment Ammount",
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
