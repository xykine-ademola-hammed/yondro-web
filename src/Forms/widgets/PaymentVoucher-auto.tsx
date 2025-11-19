import React, { useEffect, useState } from "react";
import { useAuth } from "../../GlobalContexts/AuthContext";
import moment from "moment";
import { generateVoucherCode, getFinanceCode } from "../../common/methods";
import PaymentVoucher, {
  type PaymentVoucherDataType,
  type PaymentVoucherProps,
} from "./PaymentVoucher";
import PaymentVoucherTetfund from "./PaymentVoucher-Tetfund";
import ParentRequestPreview from "./ParentRequestPreview";
import VoucherPersonnelsAssignment from "./VoucherPersonnelsAssignment";
import ModalWrapper from "../../components/modal-wrapper";

const getApplicantVoucherInfo = (voucherType: string, formResponses: any) => {
  if (voucherType === "normal") {
    return {
      applicantName: formResponses?.officerName || "",
      applicantAddress: formResponses?.applicantAddress || "",
      applicantDescription: formResponses?.purpose || "",
    };
  } else if (voucherType === "tetfund") {
    // Fetch tetfund voucher info
    return {
      applicantName: formResponses?.officerName || "",
    };
  }
  return null;
};

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
  parentRequest,
}) => {
  const { user } = useAuth();
  const [isApplicationFormOpen, openApplicationForm] = useState(false);
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

  const [applicationVoucherInfo, setApplicationVoucherInfo] =
    useState<any>(null);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, ...formResponses }));
  }, [formResponses]);

  useEffect(() => {
    if (formData.voucherFormType) {
      console.log(
        "====parentRequest FormResponses======",
        parentRequest?.formResponses
      );
      if (formData.voucherFormType === "tetfund") {
        setApplicationVoucherInfo(
          getApplicantVoucherInfo("tetfund", parentRequest?.formResponses)
        );
      }

      if (formData.voucherFormType === "normal") {
        setApplicationVoucherInfo(
          getApplicantVoucherInfo("normal", parentRequest?.formResponses)
        );
      }

      setFormData((prev) => ({
        ...prev,
        formId: 6,
      }));
    }
  }, [formData.voucherFormType, parentRequest]);

  const handleSubmit = (data: PaymentVoucherDataType, status: string) => {
    onSubmit(
      {
        ...formData,
        ...data,
        voucherFormType: formData.voucherFormType || data.voucherFormType,
      },
      status
    );
  };

  const propHolder = {
    formResponses: { ...applicationVoucherInfo, ...formResponses }, // Keep the arrangement
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
    parentRequest,
    showTobe: !formResponses?.preparedById,
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

      {parentRequest && (
        <div className="my-2 flex  items-center gap-4  border-gray-300 p-1 rounded-md border">
          <span className="text-sm font-semibold">
            Financial Request Applicatiion:
          </span>
          <button
            onClick={() => openApplicationForm(true)}
            className="rounded-lg bg-blue-300 px-4 py-2 text-sm font-semibold text-gray-500 shadow-sm hover:from-indigo-500 hover:to-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
          >
            View
          </button>
        </div>
      )}

      {!formResponses?.voucherFormType &&
        parentRequest &&
        !formResponses?.preparedById && (
          <div>
            <ParentRequestPreview
              parentRequest={parentRequest}
              onClose={() => {}}
              showApprovers={false}
              showAddDocument={false}
            />
            <VoucherPersonnelsAssignment {...propHolder} />
          </div>
        )}

      {formData?.voucherFormType === "normal" && (
        <PaymentVoucher {...propHolder} />
      )}

      {formData?.voucherFormType === "tetfund" && (
        <PaymentVoucherTetfund {...propHolder} />
      )}

      {isApplicationFormOpen && (
        <ModalWrapper
          isOpen={isApplicationFormOpen}
          onClose={() => openApplicationForm(false)}
          title={"Application Request Form"}
        >
          <ParentRequestPreview
            parentRequest={parentRequest}
            onClose={() => openApplicationForm(false)}
          />
        </ModalWrapper>
      )}
    </div>
  );
};

export default PaymentVoucherAuto;
