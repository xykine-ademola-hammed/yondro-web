import React, { useEffect, useState } from "react";
import { useAuth } from "../../GlobalContexts/AuthContext";
import moment from "moment";
import { generateVoucherCode, getFinanceCode } from "../../common/methods";

import PaymentVoucher, {
  type PaymentVoucherDataType,
  type PaymentVoucherProps,
} from "./PaymentVoucher";
import PaymentVoucherTetfund from "./PaymentVoucher-Tetfund";

export interface PaymentDetail {
  paymentDate: string;
  paymentParticles: string;
  Amount: number;
}

export interface ApplicantDetail {
  applicantName: string;
  applicantAddress: string;
  applicantDescription: string;
}

export interface EntryDistribution {
  accountTitle: string;
  accountCodeNo: string;
  debitAmount: string;
  debitDescription: string;
  creditAmount: string;
  creditDescription: string;
}

export interface PersonnelType {
  id: number;
  name: string | number;
  positionName: string;
  date: string;
}

export interface VoucherPersonnels {
  headOfUnit: PersonnelType;
  preparedBy: PersonnelType;
  reviewedBy: PersonnelType;
  approvedBy: PersonnelType;
  unitHeadBy: PersonnelType;
}

export interface AuditUnitPersonnels {
  checkedBy: PersonnelType;
  preparedBy: PersonnelType;
  reviewedBy: PersonnelType;
  approvedBy: PersonnelType;
}

export interface AuditRemark {
  pass: string;
  query: string;
}

export interface EmployeeOption {
  id: string | number;
  value: string | number;
  label: string;
}

export interface CompletedStage {
  step: string | number;
  updatedAt: string | Date;
  assignedTo: {
    firstName?: string;
    lastName?: string;
    department?: { name?: string };
    position?: { title?: string };
    [key: string]: any;
  };
}

const PaymentVoucherAuto: React.FC<PaymentVoucherProps> = ({
  formResponses,
  enableInputList = [""],
  vissibleSections = [],
  instruction = "",
  onSubmit,
  onCancel,
  showActionButtons = false,
  mode = "new",
  completedStages = [],
  responseTypes = [""],
  loading = false,
  setLoading,
  parentRequestId,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<PaymentVoucherDataType>({
    voucherNo: formResponses?.voucherNo || generateVoucherCode(),
    departmentCode: formResponses?.departmentCode || "",
    voucherFormType: "",
    applicationDate:
      (formResponses?.applicationDate as string) ||
      moment().format("YYYY-MM-DD"),
    financeCode: getFinanceCode(user),
    ...formResponses,
  });

  useEffect(() => {
    setFormData((prev) => ({ ...prev, ...formResponses }));
  }, [formResponses]);

  const handleSubmit = (data: PaymentVoucherDataType, status: string) => {
    onSubmit({ ...formData, ...data }, status);
  };

  const propHolder = {
    formResponses,
    enableInputList,
    vissibleSections,
    instruction,
    onSubmit: handleSubmit,
    onCancel,
    showActionButtons,
    mode,
    completedStages,
    responseTypes,
    loading,
    setLoading,
    parentRequestId,
  };

  return (
    <div className="">
      {/* Hide form type selection when it has been previously set */}
      {!formResponses?.voucherFormType && (
        <div className="my-4">
          <h3 className="mt-2 text-l font-semibold text-gray-700 mb-1">
            Voucher Form Type
          </h3>

          <div className="flex flex-col gap-2 border p-1 border rounded-lg border-gray-200">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="voucherFormType"
                value="normal"
                checked={formData?.voucherFormType === "normal"}
                onChange={() =>
                  setFormData((prev) => ({
                    ...prev,
                    formId: 6,
                    voucherFormType: "normal",
                  }))
                }
              />
              <span>Normal Voucher Form</span>
            </label>

            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="voucherFormType"
                value="tetfund"
                checked={formData?.voucherFormType === "tetfund"}
                onChange={() =>
                  setFormData((prev) => ({
                    ...prev,
                    formId: 6,
                    voucherFormType: "tetfund",
                  }))
                }
              />
              <span>TetFund Voucher Form</span>
            </label>
          </div>
        </div>
      )}
      {formData?.voucherFormType === "normal" ? (
        <PaymentVoucher {...propHolder} />
      ) : (
        <PaymentVoucherTetfund {...propHolder} />
      )}
    </div>
  );
};

export default PaymentVoucherAuto;
