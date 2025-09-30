import React, { useEffect, useRef, useState, type RefObject } from "react";
import { useAuth } from "../../GlobalContexts/AuthContext";
import moment from "moment";
import useDownloadPdf from "../../common/hooks/useDownloadPdf";
import Signer from "../../components/Signer";
import spedLogo from "../../assets/spedLogo.png";
import FormActions from "./FormActions";
import GenericTable from "./StoreItemTable";

const requiredFields = [
  "unit",
  "applicationDate",
  "sivNo",
  "department",
  "issueAuthoriseBy",
  "designation",
];

const requiredStoreItemFields = [
  "articles",
  "denominationOfQty",
  "qtyDemanded",
  "qtyIssued",
  "rate",
  "amount",
  "ledgerFolio",
  "remarks",
];

// --- Types ---
interface StoreItem {
  id?: string | number;
  articles: string;
  denominationOfQty: string;
  qtyDemanded: string;
  qtyIssued: string;
  rate: string;
  amount: string;
  ledgerFolio: string;
  remarks: string;
}

interface Approver {
  firstName: string;
  lastName: string;
  date?: string;
  department?: string;
  position?: string;
  label?: string;
}

interface Requestor {
  firstName?: string;
  lastName?: string;
  date?: string;
  department?: string;
  position?: string;
}

interface StoreIssueVoucherForm {
  unit?: string;
  applicationDate?: string;
  sivNo?: string;
  department?: string;
  issueAuthoriseBy?: string;
  designation?: string;
  requestor?: Requestor;
  approvers?: Approver[];
  storeItems?: StoreItem[];
  [key: string]: any;
}

interface StoreIssueVoucherProps {
  loading: boolean;
  setLoading: (value: boolean) => void;
  formResponses: StoreIssueVoucherForm;
  enableInputList?: string[];
  vissibleSections?: Array<"addMore" | string>;
  onSubmit: (data: StoreIssueVoucherForm, status: string) => void;
  onCancel: () => void;
  showActionButtons?: boolean;
  mode?: "edit" | "preview" | "new" | "in_progress";
  responseTypes: string[];
}

// default empty Item for new rows
const emptyItem: StoreItem = {
  articles: "",
  denominationOfQty: "",
  qtyDemanded: "",
  qtyIssued: "",
  rate: "",
  amount: "",
  ledgerFolio: "",
  remarks: "",
};

const StoreIssueVoucher: React.FC<StoreIssueVoucherProps> = ({
  formResponses,
  enableInputList = [""],
  vissibleSections = [],
  onSubmit,
  onCancel,
  showActionButtons = false,
  mode = "new",
  responseTypes = [""],
  loading = false,
  setLoading,
}) => {
  const componentRef = useRef<HTMLElement>(null);
  const downloadPdf = useDownloadPdf();
  const { user } = useAuth();

  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [formData, setFormData] =
    useState<StoreIssueVoucherForm>(formResponses);
  const [hasErrors, setHasErrors] = useState(false);

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const addMoreRow = () => {
    setStoreItems((prev) => [
      ...prev,
      { ...emptyItem, id: Date.now() + Math.random() },
    ]);
  };

  useEffect(() => {
    setFormData(formResponses);
    if (formResponses?.storeItems && Array.isArray(formResponses?.storeItems)) {
      setStoreItems(
        formResponses.storeItems.map((item, idx) => ({
          ...emptyItem,
          ...item,
          id: item.id ?? idx + "_" + Date.now(),
        }))
      );
    } else {
      setStoreItems([
        { ...emptyItem, id: 1 },
        { ...emptyItem, id: 2 },
        { ...emptyItem, id: 3 },
      ]);
    }
  }, [formResponses]);

  const isEnabled = (name: string) => enableInputList.includes(name);

  const checkIsValid = () => {
    const required: string[] = [];
    // Check top-level required fields
    for (let enableField of enableInputList) {
      if (requiredFields.includes(enableField) && !formData?.[enableField]) {
        required.push(enableField);
      }
    }

    for (let item of storeItems) {
      const allEmpty = requiredStoreItemFields.every(
        (field) => !item[field as keyof StoreItem]
      );
      if (allEmpty) continue;
      const hasEmpty = requiredStoreItemFields.some(
        (field) => !item[field as keyof StoreItem]
      );
      if (hasEmpty) {
        required.push("missing field");
      }
    }
    return !!required.length;
  };

  const handleSubmit = (status: string) => {
    if (!checkIsValid()) {
      setLoading(true);
      onSubmit({ ...formData, storeItems }, status);
      // setFormData({});
      // setStoreItems([]);
      setHasErrors(false);
    } else {
      setHasErrors(true);
    }
  };

  const handleCancel = () => {
    setFormData({});
    setStoreItems([]);
    onCancel();
  };

  const handleStoreItemChange = (
    eventName: keyof StoreItem,
    eventValue: string,
    index: number
  ) => {
    setStoreItems((prevItems) => {
      const updatedItems = [...prevItems];
      updatedItems[index] = {
        ...updatedItems[index],
        [eventName]: eventValue,
      };
      return updatedItems;
    });
  };

  const storeColumns = [
    {
      label: "Articles",
      field: "articles" as keyof StoreItem,
      renderCell: (
        val: string,
        _row: any,
        _idx: number,
        onChange: any,
        disabled: boolean
      ) => (
        <textarea
          rows={1}
          value={val ?? ""}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-1 border-0 focus:ring-2 focus:ring-blue-500 text-sm"
        />
      ),
      isDisabled: (_row: any, _idx: number) => !isEnabled("articles"),
    },
    {
      label: "Denomination Qty.",
      field: "denominationOfQty" as keyof StoreItem,
      isDisabled: (_row: any, _idx: number) => !isEnabled("denominationOfQty"),
    },
    {
      label: "Qty. demanded",
      field: "qtyDemanded" as keyof StoreItem,
      isDisabled: (_row: any, _idx: number) => !isEnabled("qtyDemanded"),
    },
    {
      label: "Qty. issued",
      field: "qtyIssued" as keyof StoreItem,
      isDisabled: (_row: any, _idx: number) => !isEnabled("qtyIssued"),
    },
    {
      label: "Rate",
      field: "rate" as keyof StoreItem,
      isDisabled: (_row: any, _idx: number) => !isEnabled("rate"),
    },
    {
      label: "Amount",
      field: "amount" as keyof StoreItem,
      isDisabled: (_row: any, _idx: number) => !isEnabled("amount"),
    },
    {
      label: "Ledger Folio",
      field: "ledgerFolio" as keyof StoreItem,
      isDisabled: (_row: any, _idx: number) => !isEnabled("ledgerFolio"),
    },
    {
      label: "Remarks",
      field: "remarks" as keyof StoreItem,
      isDisabled: (_row: any, _idx: number) => !isEnabled("remarks"),
    },
  ];

  return (
    <div className="">
      <div className="flex justify-end items-end ">
        <button
          className="px-2 py-1 bg-blue-900 text-white rounded"
          onClick={() =>
            downloadPdf(componentRef as RefObject<HTMLElement>, {
              fileName: "payment-voucher.pdf",
              orientation: "portrait",
              format: "a4",
              margin: 24,
              scale: 2,
              hideSelectors: ["[data-export-hide]"], // hide buttons during capture
              onBeforeCapture: () => {},
              onAfterCapture: () => {},
            })
          }
        >
          Download
        </button>
      </div>

      <div
        ref={componentRef as React.RefObject<HTMLDivElement>}
        className="bg-white rounded-lg sm:p-2 w-full max-w-4xl"
      >
        <div className="flex gap-4 mb-4 sm:mb-0">
          <img src={spedLogo} alt="Company Logo" className="h-24" />
          <div>
            <h2 className="text-center text-xl sm:text-2xl font-bold text-gray-600">
              {user?.organization?.name}
            </h2>
            <h1 className="text-xl sm:text-2xl font-semibold text-center text-gray-500">
              Store Issued Voucher
            </h1>
          </div>
        </div>

        {hasErrors && (
          <div className="bg-red-50 p-4 rounded-lg mb-2">
            <p className="text-red-800 text-sm">
              There are some errors or missing required fields
            </p>
          </div>
        )}

        {/* Header Section */}
        <div className="my-4">
          <div>
            {/* Unit */}
            <div className="flex flex-col md:flex-row items-start md:items-center mb-2">
              <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                <span className="text-xs font-semibold">Unit: </span>
              </div>
              <div className="w-full">
                <input
                  type="text"
                  value={formData?.unit ?? ""}
                  disabled={!isEnabled("unit")}
                  onChange={(e) => handleInputChange("unit", e.target.value)}
                  className={`w-full p-1 border ${
                    isEnabled("unit") ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs`}
                />
              </div>
            </div>
            {/* Date & SIV No */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                  <span className="text-xs font-semibold">Date: </span>
                </div>
                <div className="w-full">
                  <input
                    type="date"
                    disabled={!isEnabled("applicationDate")}
                    value={formData?.applicationDate ?? ""}
                    onChange={(e) =>
                      handleInputChange("applicationDate", e.target.value)
                    }
                    className={`w-full p-1 border ${
                      isEnabled("applicationDate")
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs`}
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                  <span className="text-xs font-semibold">SIV No: </span>
                </div>
                <div className="w-full">
                  <input
                    type="text"
                    value={formData?.sivNo ?? ""}
                    disabled={!isEnabled("sivNo")}
                    onChange={(e) => handleInputChange("sivNo", e.target.value)}
                    className={`w-full p-1 border ${
                      isEnabled("sivNo") ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs`}
                  />
                </div>
              </div>
            </div>
            {/* Department */}
            <div className="flex flex-col md:flex-row items-start md:items-center mb-2">
              <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                <span className="text-xs font-semibold">Department: </span>
              </div>
              <div className="w-full">
                <input
                  type="text"
                  value={formData?.department ?? ""}
                  disabled={!isEnabled("department")}
                  onChange={(e) =>
                    handleInputChange("department", e.target.value)
                  }
                  className={`w-full p-1 border ${
                    isEnabled("department")
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs`}
                />
              </div>
            </div>
            {/* Authorised By & Designation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                  <span className="text-xs font-semibold">Authorised By: </span>
                </div>
                <div className="w-full">
                  <input
                    type="text"
                    value={formData?.issueAuthoriseBy ?? ""}
                    disabled={!isEnabled("issueAuthoriseBy")}
                    onChange={(e) =>
                      handleInputChange("issueAuthoriseBy", e.target.value)
                    }
                    className={`w-full p-1 border ${
                      isEnabled("issueAuthoriseBy")
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs`}
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className="mb-1 md:mb-0 md:mr-2 min-w-max">
                  <span className="text-xs font-semibold">Designation: </span>
                </div>
                <div className="w-full">
                  <input
                    type="text"
                    value={formData?.designation ?? ""}
                    disabled={!isEnabled("designation")}
                    onChange={(e) =>
                      handleInputChange("designation", e.target.value)
                    }
                    className={`w-full p-1 border ${
                      isEnabled("designation")
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <GenericTable
          columns={storeColumns}
          rows={storeItems}
          onCellChange={(field, value, rowIndex, _row) => {
            handleStoreItemChange(field, value, rowIndex);
          }}
          onAddRow={addMoreRow}
          canAddRow={vissibleSections?.includes("addMore")}
          addRowLabel="Add row"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-20 ">
          <Signer
            firstName={formData?.requestor?.firstName || user?.firstName || ""}
            lastName={formData?.requestor?.lastName || user?.lastName || ""}
            date={
              formData?.requestor?.date ||
              moment(new Date()).format("DD/MM/YYYY")
            }
            department={
              formData?.requestor?.department || user?.department?.name || ""
            }
            position={
              formData?.requestor?.position || user?.position?.title || ""
            }
            label="Request by"
          />

          {(formData?.approvers || []).map((approver, idx) => (
            <Signer
              key={idx}
              firstName={approver.firstName}
              lastName={approver.lastName}
              date={approver.date ?? ""}
              department={approver.department ?? ""}
              position={approver.position ?? ""}
              label={approver.label || `Approved`}
            />
          ))}
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg mb-2">
          <p className="text-yellow-800 text-xs">
            Original and Duplicate for cards & Ledger Posting, Triplicate to the
            Department of use and Quadruplicate remains in the book.
          </p>
        </div>

        {/* Action Buttons */}
        {showActionButtons && (
          <FormActions
            loading={loading}
            handleCancel={handleCancel}
            mode={mode}
            handleSubmit={handleSubmit}
            responseTypes={responseTypes}
          />
        )}
      </div>
    </div>
  );
};

export default StoreIssueVoucher;
